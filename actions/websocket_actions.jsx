// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';
import {ChannelTypes, EmojiTypes, PostTypes, TeamTypes, UserTypes, RoleTypes, GeneralTypes, AdminTypes} from 'mattermost-redux/action_types';
import {WebsocketEvents, General} from 'mattermost-redux/constants';
import {
    getChannelAndMyMember,
    getChannelStats,
    viewChannel,
    markChannelAsRead,
} from 'mattermost-redux/actions/channels';
import {setServerVersion} from 'mattermost-redux/actions/general';
import {clearErrors, logError} from 'mattermost-redux/actions/errors';

import {getPosts, getProfilesAndStatusesForPosts, getCustomEmojiForReaction} from 'mattermost-redux/actions/posts';
import * as TeamActions from 'mattermost-redux/actions/teams';
import {getMe, getStatusesByIds, getProfilesByIds} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {getMyTeams, getCurrentRelativeTeamUrl, getCurrentTeamId, getCurrentTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getChannel, getCurrentChannel, getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {openModal} from 'actions/views/modals';
import {incrementWsErrorCount, resetWsErrorCount} from 'actions/views/system';

import {browserHistory} from 'utils/browser_history';
import {loadChannelsForCurrentUser} from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import {handleNewPost} from 'actions/post_actions.jsx';
import * as StatusActions from 'actions/status_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import store from 'stores/redux_store.jsx';
import WebSocketClient from 'client/web_websocket_client.jsx';
import {loadPlugin, loadPluginsIfNecessary, removePlugin} from 'plugins';
import {ActionTypes, Constants, AnnouncementBarMessages, SocketEvents, UserStatuses, ModalIdentifiers} from 'utils/constants.jsx';
import {fromAutoResponder} from 'utils/post_utils';
import {getSiteURL} from 'utils/url.jsx';
import RemovedFromChannelModal from 'components/removed_from_channel_modal';

const dispatch = store.dispatch;
const getState = store.getState;

const MAX_WEBSOCKET_FAILS = 7;

const pluginEventHandlers = {};

export function initialize() {
    if (!window.WebSocket) {
        console.log('Browser does not support websocket'); //eslint-disable-line no-console
        return;
    }

    const config = getConfig(getState());
    let connUrl = '';
    if (config.WebsocketURL) {
        connUrl = config.WebsocketURL;
    } else {
        connUrl = new URL(getSiteURL());

        // replace the protocol with a websocket one
        if (connUrl.protocol === 'https:') {
            connUrl.protocol = 'wss:';
        } else {
            connUrl.protocol = 'ws:';
        }

        // append a port number if one isn't already specified
        if (!(/:\d+$/).test(connUrl.host)) {
            if (connUrl.protocol === 'wss:') {
                connUrl.host += ':' + config.WebsocketSecurePort;
            } else {
                connUrl.host += ':' + config.WebsocketPort;
            }
        }

        connUrl = connUrl.toString();
    }

    // Strip any trailing slash before appending the pathname below.
    if (connUrl.length > 0 && connUrl[connUrl.length - 1] === '/') {
        connUrl = connUrl.substring(0, connUrl.length - 1);
    }

    connUrl += Client4.getUrlVersion() + '/websocket';

    WebSocketClient.setEventCallback(handleEvent);
    WebSocketClient.setFirstConnectCallback(handleFirstConnect);
    WebSocketClient.setReconnectCallback(() => reconnect(false));
    WebSocketClient.setMissedEventCallback(() => reconnect(false));
    WebSocketClient.setCloseCallback(handleClose);
    WebSocketClient.initialize(connUrl);
}

export function close() {
    WebSocketClient.close();
}

function reconnectWebSocket() {
    close();
    initialize();
}

const pluginReconnectHandlers = {};

export function registerPluginReconnectHandler(pluginId, handler) {
    pluginReconnectHandlers[pluginId] = handler;
}

export function unregisterPluginReconnectHandler(pluginId) {
    Reflect.deleteProperty(pluginReconnectHandlers, pluginId);
}

export function reconnect(includeWebSocket = true) {
    if (includeWebSocket) {
        reconnectWebSocket();
    }

    loadPluginsIfNecessary();

    Object.values(pluginReconnectHandlers).forEach((handler) => {
        if (handler && typeof handler === 'function') {
            handler();
        }
    });

    const currentTeamId = getState().entities.teams.currentTeamId;
    if (currentTeamId) {
        dispatch(loadChannelsForCurrentUser());
        dispatch(getPosts(getCurrentChannelId(getState())));
        StatusActions.loadStatusesForChannelAndSidebar();
        dispatch(TeamActions.getMyTeamUnreads());
    }

    dispatch(resetWsErrorCount());
    dispatch(clearErrors());
}

let intervalId = '';
const SYNC_INTERVAL_MILLISECONDS = 1000 * 60 * 15; // 15 minutes

export function startPeriodicSync() {
    clearInterval(intervalId);

    intervalId = setInterval(
        () => {
            if (getCurrentUser(getState()) != null) {
                reconnect(false);
            }
        },
        SYNC_INTERVAL_MILLISECONDS
    );
}

export function stopPeriodicSync() {
    clearInterval(intervalId);
}

export function registerPluginWebSocketEvent(pluginId, event, action) {
    if (!pluginEventHandlers[pluginId]) {
        pluginEventHandlers[pluginId] = {};
    }
    pluginEventHandlers[pluginId][event] = action;
}

export function unregisterPluginWebSocketEvent(pluginId, event) {
    const events = pluginEventHandlers[pluginId];
    if (!events) {
        return;
    }

    Reflect.deleteProperty(events, event);
}

export function unregisterAllPluginWebSocketEvents(pluginId) {
    Reflect.deleteProperty(pluginEventHandlers, pluginId);
}

function handleFirstConnect() {
    dispatch(clearErrors);
}

function handleClose(failCount) {
    if (failCount > MAX_WEBSOCKET_FAILS) {
        dispatch(logError({type: 'critical', message: AnnouncementBarMessages.WEBSOCKET_PORT_ERROR}, true));
    }
    dispatch(incrementWsErrorCount());
}

function handleEvent(msg) {
    switch (msg.event) {
    case SocketEvents.POSTED:
    case SocketEvents.EPHEMERAL_MESSAGE:
        handleNewPostEvent(msg);
        break;

    case SocketEvents.POST_EDITED:
        handlePostEditEvent(msg);
        break;

    case SocketEvents.POST_DELETED:
        handlePostDeleteEvent(msg);
        break;

    case SocketEvents.LEAVE_TEAM:
        handleLeaveTeamEvent(msg);
        break;

    case SocketEvents.UPDATE_TEAM:
        handleUpdateTeamEvent(msg);
        break;

    case SocketEvents.DELETE_TEAM:
        handleDeleteTeamEvent(msg);
        break;

    case SocketEvents.ADDED_TO_TEAM:
        handleTeamAddedEvent(msg);
        break;

    case SocketEvents.USER_ADDED:
        handleUserAddedEvent(msg);
        break;

    case SocketEvents.USER_REMOVED:
        handleUserRemovedEvent(msg);
        break;

    case SocketEvents.USER_UPDATED:
        handleUserUpdatedEvent(msg);
        break;

    case SocketEvents.ROLE_ADDED:
        handleRoleAddedEvent(msg, dispatch, getState);
        break;

    case SocketEvents.ROLE_REMOVED:
        handleRoleRemovedEvent(msg, dispatch, getState);
        break;

    case SocketEvents.MEMBERROLE_UPDATED:
        handleUpdateMemberRoleEvent(msg);
        break;

    case SocketEvents.ROLE_UPDATED:
        handleRoleUpdatedEvent(msg, dispatch, getState);
        break;

    case SocketEvents.CHANNEL_CREATED:
        handleChannelCreatedEvent(msg);
        break;

    case SocketEvents.CHANNEL_DELETED:
        handleChannelDeletedEvent(msg);
        break;

    case SocketEvents.CHANNEL_CONVERTED:
        handleChannelConvertedEvent(msg);
        break;

    case SocketEvents.CHANNEL_UPDATED:
        handleChannelUpdatedEvent(msg);
        break;

    case SocketEvents.CHANNEL_MEMBER_UPDATED:
        handleChannelMemberUpdatedEvent(msg);
        break;

    case SocketEvents.DIRECT_ADDED:
        handleDirectAddedEvent(msg);
        break;

    case SocketEvents.PREFERENCE_CHANGED:
        handlePreferenceChangedEvent(msg);
        break;

    case SocketEvents.PREFERENCES_CHANGED:
        handlePreferencesChangedEvent(msg);
        break;

    case SocketEvents.PREFERENCES_DELETED:
        handlePreferencesDeletedEvent(msg);
        break;

    case SocketEvents.TYPING:
        handleUserTypingEvent(msg);
        break;

    case SocketEvents.STATUS_CHANGED:
        handleStatusChangedEvent(msg);
        break;

    case SocketEvents.HELLO:
        handleHelloEvent(msg);
        break;

    case SocketEvents.REACTION_ADDED:
        handleReactionAddedEvent(msg);
        break;

    case SocketEvents.REACTION_REMOVED:
        handleReactionRemovedEvent(msg);
        break;

    case SocketEvents.EMOJI_ADDED:
        handleAddEmoji(msg);
        break;

    case SocketEvents.CHANNEL_VIEWED:
        handleChannelViewedEvent(msg);
        break;

    case SocketEvents.PLUGIN_ENABLED:
        handlePluginEnabled(msg);
        break;

    case SocketEvents.PLUGIN_DISABLED:
        handlePluginDisabled(msg);
        break;

    case SocketEvents.USER_ROLE_UPDATED:
        handleUserRoleUpdated(msg);
        break;

    case SocketEvents.CONFIG_CHANGED:
        handleConfigChanged(msg);
        break;

    case SocketEvents.LICENSE_CHANGED:
        handleLicenseChanged(msg);
        break;

    case SocketEvents.PLUGIN_STATUSES_CHANGED:
        handlePluginStatusesChangedEvent(msg);
        break;

    default:
    }

    Object.values(pluginEventHandlers).forEach((pluginEvents) => {
        if (!pluginEvents) {
            return;
        }

        if (pluginEvents.hasOwnProperty(msg.event) && typeof pluginEvents[msg.event] === 'function') {
            pluginEvents[msg.event](msg);
        }
    });
}

// handleChannelConvertedEvent handles updating of channel which is converted from public to private
function handleChannelConvertedEvent(msg) {
    const channelId = msg.data.channel_id;
    if (channelId) {
        const channel = getChannel(getState(), channelId);
        if (channel) {
            dispatch({
                type: ChannelTypes.RECEIVED_CHANNEL,
                data: {...channel, type: General.PRIVATE_CHANNEL},
            });
        }
    }
}

function handleChannelUpdatedEvent(msg) {
    const channel = JSON.parse(msg.data.channel);
    dispatch({type: ChannelTypes.RECEIVED_CHANNEL, data: channel});
}

function handleChannelMemberUpdatedEvent(msg) {
    const channelMember = JSON.parse(msg.data.channelMember);
    dispatch({type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER, data: channelMember});
}

function handleNewPostEvent(msg) {
    const post = JSON.parse(msg.data.post);
    dispatch(handleNewPost(post, msg));

    getProfilesAndStatusesForPosts([post], dispatch, getState);

    if (post.user_id !== getCurrentUserId(getState()) && !fromAutoResponder(post)) {
        dispatch({
            type: UserTypes.RECEIVED_STATUSES,
            data: [{user_id: post.user_id, status: UserStatuses.ONLINE}],
        });
    }
}

function handlePostEditEvent(msg) {
    // Store post
    const post = JSON.parse(msg.data.post);
    dispatch({
        type: PostTypes.RECEIVED_POSTS,
        data: {
            order: [],
            posts: {
                [post.id]: post,
            },
        },
        channelId: post.channel_id,
    });

    getProfilesAndStatusesForPosts([post], dispatch, getState);
    const currentChannelId = getCurrentChannelId(getState());

    // Update channel state
    if (currentChannelId === msg.broadcast.channel_id) {
        if (window.isActive) {
            dispatch(viewChannel(currentChannelId));
        }
    }

    // Needed for search store
    AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.POST_UPDATED,
        post,
    });
}

function handlePostDeleteEvent(msg) {
    const post = JSON.parse(msg.data.post);
    dispatch({type: PostTypes.POST_DELETED, data: post});

    // Needed for search store
    AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.POST_DELETED,
        post,
    });
}

async function handleTeamAddedEvent(msg) {
    await dispatch(TeamActions.getTeam(msg.data.team_id));
    await dispatch(TeamActions.getMyTeamMembers());
    await dispatch(TeamActions.getMyTeamUnreads());
}

function handleLeaveTeamEvent(msg) {
    const state = getState();

    dispatch(batchActions([
        {
            type: UserTypes.RECEIVED_PROFILE_NOT_IN_TEAM,
            data: {id: msg.data.team_id, user_id: msg.data.user_id},
        },
        {
            type: TeamTypes.REMOVE_MEMBER_FROM_TEAM,
            data: {team_id: msg.data.team_id, user_id: msg.data.user_id},
        },
    ]));

    if (getCurrentUserId(state) === msg.data.user_id) {
        dispatch({type: TeamTypes.LEAVE_TEAM, data: {id: msg.data.team_id}});

        // if they are on the team being removed redirect them to default team
        if (getCurrentTeamId(state) === msg.data.team_id) {
            if (!global.location.pathname.startsWith('/admin_console')) {
                GlobalActions.redirectUserToDefaultTeam();
            }
        }
    }
}

function handleUpdateTeamEvent(msg) {
    dispatch({type: TeamTypes.UPDATED_TEAM, data: msg.data.team});
}

function handleDeleteTeamEvent(msg) {
    const deletedTeam = JSON.parse(msg.data.team);
    const state = store.getState();
    const {teams} = state.entities.teams;
    if (
        deletedTeam &&
        teams &&
        teams[deletedTeam.id] &&
        teams[deletedTeam.id].delete_at === 0
    ) {
        const {currentUserId} = state.entities.users;
        const {currentTeamId, myMembers} = state.entities.teams;
        const teamMembers = Object.values(myMembers);
        const teamMember = teamMembers.find((m) => m.user_id === currentUserId && m.team_id === currentTeamId);

        let newTeamId = '';
        if (
            deletedTeam &&
            teamMember &&
            deletedTeam.id === teamMember.team_id
        ) {
            const myTeams = {};
            getMyTeams(state).forEach((t) => {
                myTeams[t.id] = t;
            });

            for (let i = 0; i < teamMembers.length; i++) {
                const memberTeamId = teamMembers[i].team_id;
                if (
                    myTeams &&
                    myTeams[memberTeamId] &&
                    myTeams[memberTeamId].delete_at === 0 &&
                    deletedTeam.id !== memberTeamId
                ) {
                    newTeamId = memberTeamId;
                    break;
                }
            }
        }

        dispatch(batchActions([
            {type: TeamTypes.RECEIVED_TEAM_DELETED, data: {id: deletedTeam.id}},
            {type: TeamTypes.UPDATED_TEAM, data: deletedTeam},
        ]));

        if (newTeamId) {
            dispatch({type: TeamTypes.SELECT_TEAM, data: newTeamId});
            browserHistory.push(`${getCurrentTeamUrl(getState())}/channels/${Constants.DEFAULT_CHANNEL}`);
        } else {
            browserHistory.push('/');
        }
    }
}

function handleUpdateMemberRoleEvent(msg) {
    dispatch({
        type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
        data: msg.data.member,
    });
}

function handleDirectAddedEvent(msg) {
    dispatch(getChannelAndMyMember(msg.broadcast.channel_id));
}

function handleUserAddedEvent(msg) {
    const currentChannelId = getCurrentChannelId(getState());
    if (currentChannelId === msg.broadcast.channel_id) {
        dispatch(getChannelStats(currentChannelId));
        dispatch({
            type: UserTypes.RECEIVED_PROFILE_IN_CHANNEL,
            data: {id: msg.broadcast.channel_id, user_id: msg.data.user_id},
        });
    }

    const currentTeamId = getCurrentTeamId(getState());
    const currentUserId = getCurrentUserId(getState());
    if (currentTeamId === msg.data.team_id && currentUserId === msg.data.user_id) {
        dispatch(getChannelAndMyMember(msg.broadcast.channel_id));
    }
}

function handleUserRemovedEvent(msg) {
    const state = getState();
    const currentChannel = getCurrentChannel(state) || {};
    const currentUserId = getCurrentUserId(state);

    if (msg.broadcast.user_id === currentUserId) {
        dispatch(loadChannelsForCurrentUser());

        if (msg.data.channel_id === currentChannel.id) {
            GlobalActions.emitCloseRightHandSide();

            if (msg.data.remover_id === msg.broadcast.user_id) {
                browserHistory.push(getCurrentRelativeTeamUrl(state));
            } else {
                const user = getUser(state, msg.data.remover_id) || {};

                dispatch(openModal({
                    modalId: ModalIdentifiers.REMOVED_FROM_CHANNEL,
                    dialogType: RemovedFromChannelModal,
                    dialogProps: {
                        channelName: currentChannel.display_name,
                        remover: user.username,
                    },
                }));
            }
        }

        dispatch({
            type: ChannelTypes.LEAVE_CHANNEL,
            data: {id: msg.data.channel_id, user_id: msg.broadcast.user_id},
        });
    } else if (msg.broadcast.channel_id === currentChannel.id) {
        dispatch(getChannelStats(currentChannel.id));
        dispatch({
            type: UserTypes.RECEIVED_PROFILE_NOT_IN_CHANNEL,
            data: {id: msg.broadcast.channel_id, user_id: msg.data.user_id},
        });
    }
}

function handleUserUpdatedEvent(msg) {
    const currentUser = getCurrentUser(getState());
    const user = msg.data.user;

    if (currentUser.id === user.id) {
        if (user.update_at > currentUser.update_at) {
            // Need to request me to make sure we don't override with sanitized fields from the
            // websocket event
            getMe()(dispatch, getState);
        }
    } else {
        dispatch({
            type: UserTypes.RECEIVED_PROFILE,
            data: user,
        });
    }
}

function handleRoleAddedEvent(msg) {
    const role = JSON.parse(msg.data.role);

    dispatch({
        type: RoleTypes.RECEIVED_ROLE,
        data: role,
    });
}

function handleRoleRemovedEvent(msg) {
    const role = JSON.parse(msg.data.role);

    dispatch({
        type: RoleTypes.ROLE_DELETED,
        data: role,
    });
}

function handleRoleUpdatedEvent(msg) {
    const role = JSON.parse(msg.data.role);

    dispatch({
        type: RoleTypes.RECEIVED_ROLE,
        data: role,
    });
}

function handleChannelCreatedEvent(msg) {
    const channelId = msg.data.channel_id;
    const teamId = msg.data.team_id;
    const state = getState();

    if (getCurrentTeamId(state) === teamId && !getChannel(state, channelId)) {
        dispatch(getChannelAndMyMember(channelId));
    }
}

function handleChannelDeletedEvent(msg) {
    const state = getState();
    const config = getConfig(state);
    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';
    if (getCurrentChannelId(state) === msg.data.channel_id && !viewArchivedChannels) {
        const teamUrl = getCurrentRelativeTeamUrl(state);
        browserHistory.push(teamUrl + '/channels/' + Constants.DEFAULT_CHANNEL);
    }

    dispatch({type: ChannelTypes.RECEIVED_CHANNEL_DELETED, data: {id: msg.data.channel_id, team_id: msg.broadcast.team_id, deleteAt: msg.data.delete_at}});
}

function handlePreferenceChangedEvent(msg) {
    const preference = JSON.parse(msg.data.preference);
    GlobalActions.emitPreferenceChangedEvent(preference);
}

function handlePreferencesChangedEvent(msg) {
    const preferences = JSON.parse(msg.data.preferences);
    GlobalActions.emitPreferencesChangedEvent(preferences);
}

function handlePreferencesDeletedEvent(msg) {
    const preferences = JSON.parse(msg.data.preferences);
    GlobalActions.emitPreferencesDeletedEvent(preferences);
}

function handleUserTypingEvent(msg) {
    const state = getState();
    const config = getConfig(state);
    const currentUserId = getCurrentUserId(state);
    const currentUser = getCurrentUser(state);
    const userId = msg.data.user_id;

    const data = {
        id: msg.broadcast.channel_id + msg.data.parent_id,
        userId,
        now: Date.now(),
    };

    dispatch({
        type: WebsocketEvents.TYPING,
        data,
    }, getState);

    setTimeout(() => {
        dispatch({
            type: WebsocketEvents.STOP_TYPING,
            data,
        }, getState);
    }, parseInt(config.TimeBetweenUserTypingUpdatesMilliseconds, 10));

    if (!currentUser && userId !== currentUserId) {
        getProfilesByIds([userId])(dispatch, getState);
    }

    const status = getStatusForUserId(state, userId);
    if (status !== General.ONLINE) {
        getStatusesByIds([userId])(dispatch, getState);
    }
}

function handleStatusChangedEvent(msg) {
    dispatch({
        type: UserTypes.RECEIVED_STATUSES,
        data: [{user_id: msg.data.user_id, status: msg.data.status}],
    });
}

function handleHelloEvent(msg) {
    setServerVersion(msg.data.server_version)(dispatch, getState);
}

function handleReactionAddedEvent(msg) {
    const reaction = JSON.parse(msg.data.reaction);

    dispatch(getCustomEmojiForReaction(reaction.emoji_name));

    dispatch({
        type: PostTypes.RECEIVED_REACTION,
        data: reaction,
    });
}

function handleAddEmoji(msg) {
    const data = JSON.parse(msg.data.emoji);

    dispatch({
        type: EmojiTypes.RECEIVED_CUSTOM_EMOJI,
        data,
    });
}

function handleReactionRemovedEvent(msg) {
    const reaction = JSON.parse(msg.data.reaction);

    dispatch({
        type: PostTypes.REACTION_DELETED,
        data: reaction,
    });
}

function handleChannelViewedEvent(msg) {
    // Useful for when multiple devices have the app open to different channels
    if ((!window.isActive || getCurrentChannelId(getState()) !== msg.data.channel_id) &&
        getCurrentUserId(getState()) === msg.broadcast.user_id) {
        dispatch(markChannelAsRead(msg.data.channel_id, '', false));
    }
}

function handlePluginEnabled(msg) {
    const manifest = msg.data.manifest;
    store.dispatch({type: ActionTypes.RECEIVED_WEBAPP_PLUGIN, data: manifest});
    loadPlugin(manifest);
}

function handlePluginDisabled(msg) {
    const manifest = msg.data.manifest;
    store.dispatch({type: ActionTypes.REMOVED_WEBAPP_PLUGIN, data: manifest});
    removePlugin(manifest);
}

function handleUserRoleUpdated(msg) {
    const user = store.getState().entities.users.profiles[msg.data.user_id];

    if (user) {
        const roles = msg.data.roles;
        const demoted = user.roles.includes(Constants.PERMISSIONS_SYSTEM_ADMIN) && !roles.includes(Constants.PERMISSIONS_SYSTEM_ADMIN);

        store.dispatch({type: UserTypes.RECEIVED_PROFILE, data: {...user, roles}});

        if (demoted && global.location.pathname.startsWith('/admin_console')) {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }
}

function handleConfigChanged(msg) {
    store.dispatch({type: GeneralTypes.CLIENT_CONFIG_RECEIVED, data: msg.data.config});
}

function handleLicenseChanged(msg) {
    store.dispatch({type: GeneralTypes.CLIENT_LICENSE_RECEIVED, data: msg.data.license});
}

function handlePluginStatusesChangedEvent(msg) {
    store.dispatch({type: AdminTypes.RECEIVED_PLUGIN_STATUSES, data: msg.data.plugin_statuses});
}
