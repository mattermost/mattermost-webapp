// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';
import {
    ChannelTypes,
    EmojiTypes,
    PostTypes,
    TeamTypes,
    UserTypes,
    RoleTypes,
    GeneralTypes,
    AdminTypes,
    IntegrationTypes,
    PreferenceTypes,
} from 'mattermost-redux/action_types';
import {WebsocketEvents, General} from 'mattermost-redux/constants';
import {
    getChannelAndMyMember,
    getChannelStats,
    viewChannel,
    markChannelAsRead,
} from 'mattermost-redux/actions/channels';
import {setServerVersion} from 'mattermost-redux/actions/general';
import {
    getCustomEmojiForReaction,
    getPosts,
    getProfilesAndStatusesForPosts,
    getThreadsForPosts,
    postDeleted,
    receivedNewPost,
    receivedPost,
} from 'mattermost-redux/actions/posts';
import {clearErrors, logError} from 'mattermost-redux/actions/errors';

import * as TeamActions from 'mattermost-redux/actions/teams';
import {
    checkForModifiedUsers,
    getMe,
    getMissingProfilesByIds,
    getStatusesByIds,
} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {getMyTeams, getCurrentRelativeTeamUrl, getCurrentTeamId, getCurrentTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getChannel, getCurrentChannel, getCurrentChannelId, getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';
import {getPost, getMostRecentPostIdInChannel} from 'mattermost-redux/selectors/entities/posts';

import {getSelectedChannelId} from 'selectors/rhs';

import {openModal} from 'actions/views/modals';
import {incrementWsErrorCount, resetWsErrorCount} from 'actions/views/system';
import {closeRightHandSide} from 'actions/views/rhs';
import {syncPostsInChannel} from 'actions/views/channel';

import {browserHistory} from 'utils/browser_history';
import {loadChannelsForCurrentUser} from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import {handleNewPost} from 'actions/post_actions.jsx';
import * as StatusActions from 'actions/status_actions.jsx';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import store from 'stores/redux_store.jsx';
import WebSocketClient from 'client/web_websocket_client.jsx';
import {loadPlugin, loadPluginsIfNecessary, removePlugin} from 'plugins';
import {Constants, AnnouncementBarMessages, SocketEvents, UserStatuses, ModalIdentifiers} from 'utils/constants.jsx';
import {fromAutoResponder} from 'utils/post_utils';
import {getSiteURL} from 'utils/url.jsx';
import RemovedFromChannelModal from 'components/removed_from_channel_modal';
import InteractiveDialog from 'components/interactive_dialog';

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

    dispatch({
        type: GeneralTypes.WEBSOCKET_SUCCESS,
        timestamp: Date.now(),
    });

    loadPluginsIfNecessary();

    Object.values(pluginReconnectHandlers).forEach((handler) => {
        if (handler && typeof handler === 'function') {
            handler();
        }
    });

    const state = getState();
    const currentTeamId = state.entities.teams.currentTeamId;
    if (currentTeamId) {
        const currentChannelId = getCurrentChannelId(state);
        const mostRecentId = getMostRecentPostIdInChannel(state, currentChannelId);
        const mostRecentPost = getPost(state, mostRecentId);
        dispatch(loadChannelsForCurrentUser());
        if (mostRecentPost) {
            dispatch(syncPostsInChannel(currentChannelId, mostRecentPost.create_at));
        } else {
            // if network timed-out the first time when loading a channel
            // we can request for getPosts again when socket is connected
            dispatch(getPosts(currentChannelId));
        }
        StatusActions.loadStatusesForChannelAndSidebar();
        dispatch(TeamActions.getMyTeamUnreads());
    }

    if (state.websocket.lastDisconnectAt) {
        dispatch(checkForModifiedUsers());
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
    dispatch(batchActions([
        {
            type: GeneralTypes.WEBSOCKET_SUCCESS,
            timestamp: Date.now(),
        },
        clearErrors(),
    ]));
}

function handleClose(failCount) {
    if (failCount > MAX_WEBSOCKET_FAILS) {
        dispatch(logError({type: 'critical', message: AnnouncementBarMessages.WEBSOCKET_PORT_ERROR}, true));
    }
    dispatch(batchActions([
        {
            type: GeneralTypes.WEBSOCKET_FAILURE,
            timestamp: Date.now(),
        },
        incrementWsErrorCount(),
    ]));
}

export function handleEvent(msg) {
    switch (msg.event) {
    case SocketEvents.POSTED:
    case SocketEvents.EPHEMERAL_MESSAGE:
        handleNewPostEventDebounced(msg);
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
        handleRoleAddedEvent(msg);
        break;

    case SocketEvents.ROLE_REMOVED:
        handleRoleRemovedEvent(msg);
        break;

    case SocketEvents.MEMBERROLE_UPDATED:
        handleUpdateMemberRoleEvent(msg);
        break;

    case SocketEvents.ROLE_UPDATED:
        handleRoleUpdatedEvent(msg);
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
        dispatch(handleChannelUpdatedEvent(msg));
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
        dispatch(handleUserTypingEvent(msg));
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

    case SocketEvents.OPEN_DIALOG:
        handleOpenDialogEvent(msg);
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

export function handleChannelUpdatedEvent(msg) {
    return (doDispatch, doGetState) => {
        const channel = JSON.parse(msg.data.channel);

        doDispatch({type: ChannelTypes.RECEIVED_CHANNEL, data: channel});

        const state = doGetState();
        if (channel.id === getCurrentChannelId(state)) {
            browserHistory.replace(`${getCurrentRelativeTeamUrl(state)}/channels/${channel.name}`);
        }
    };
}

function handleChannelMemberUpdatedEvent(msg) {
    const channelMember = JSON.parse(msg.data.channelMember);
    dispatch({type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER, data: channelMember});
}

function debouncePostEvent(wait) {
    let timeout;
    let queue = [];
    let count = 0;

    // Called when timeout triggered
    const triggered = () => {
        timeout = null;

        if (queue.length > 0) {
            dispatch(handleNewPostEvents(queue));
        }

        queue = [];
        count = 0;
    };

    return function fx(msg) {
        if (timeout && count > 2) {
            // If the timeout is going this is the second or further event so queue them up.
            if (queue.push(msg) > 200) {
                // Don't run us out of memory, give up if the queue gets insane
                queue = [];
                console.log('channel broken because of too many incoming messages'); //eslint-disable-line no-console
            }
            clearTimeout(timeout);
            timeout = setTimeout(triggered, wait);
        } else {
            // Apply immediately for events up until count reaches limit
            count += 1;
            dispatch(handleNewPostEvent(msg));
            clearTimeout(timeout);
            timeout = setTimeout(triggered, wait);
        }
    };
}

const handleNewPostEventDebounced = debouncePostEvent(100);

export function handleNewPostEvent(msg) {
    return (myDispatch, myGetState) => {
        const post = JSON.parse(msg.data.post);
        myDispatch(handleNewPost(post, msg));

        getProfilesAndStatusesForPosts([post], myDispatch, myGetState);

        if (post.user_id !== getCurrentUserId(myGetState()) && !fromAutoResponder(post)) {
            myDispatch({
                type: UserTypes.RECEIVED_STATUSES,
                data: [{user_id: post.user_id, status: UserStatuses.ONLINE}],
            });
        }
    };
}

export function handleNewPostEvents(queue) {
    return (myDispatch, myGetState) => {
        const posts = queue.map((msg) => JSON.parse(msg.data.post));

        // Receive the posts as one continuous block since they were received within a short period
        const actions = posts.map(receivedNewPost);
        myDispatch(batchActions(actions));

        // Load the posts' threads
        myDispatch(getThreadsForPosts(posts));

        // And any other data needed for them
        getProfilesAndStatusesForPosts(posts, myDispatch, myGetState);
    };
}

export function handlePostEditEvent(msg) {
    // Store post
    const post = JSON.parse(msg.data.post);
    dispatch(receivedPost(post));

    getProfilesAndStatusesForPosts([post], dispatch, getState);
    const currentChannelId = getCurrentChannelId(getState());

    // Update channel state
    if (currentChannelId === msg.broadcast.channel_id) {
        if (window.isActive) {
            dispatch(viewChannel(currentChannelId));
        }
    }
}

function handlePostDeleteEvent(msg) {
    const post = JSON.parse(msg.data.post);
    dispatch(postDeleted(post));
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
    dispatch({type: TeamTypes.UPDATED_TEAM, data: JSON.parse(msg.data.team)});
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
            const globalState = getState();
            const redirectChannel = getRedirectChannelNameForTeam(globalState, newTeamId);
            browserHistory.push(`${getCurrentTeamUrl(globalState)}/channels/${redirectChannel}`);
        } else {
            browserHistory.push('/');
        }
    }
}

function handleUpdateMemberRoleEvent(msg) {
    dispatch({
        type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
        data: JSON.parse(msg.data.member),
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

export function handleUserRemovedEvent(msg) {
    const state = getState();
    const currentChannel = getCurrentChannel(state) || {};
    const currentUserId = getCurrentUserId(state);

    if (msg.broadcast.user_id === currentUserId) {
        dispatch(loadChannelsForCurrentUser());

        const rhsChannelId = getSelectedChannelId(state);
        if (msg.data.channel_id === rhsChannelId) {
            dispatch(closeRightHandSide());
        }

        if (msg.data.channel_id === currentChannel.id) {
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
        const currentTeamId = getCurrentTeamId(state);
        const redirectChannel = getRedirectChannelNameForTeam(state, currentTeamId);
        browserHistory.push(teamUrl + '/channels/' + redirectChannel);
    }

    dispatch({type: ChannelTypes.RECEIVED_CHANNEL_DELETED, data: {id: msg.data.channel_id, team_id: msg.broadcast.team_id, deleteAt: msg.data.delete_at, viewArchivedChannels}});
}

function handlePreferenceChangedEvent(msg) {
    const preference = JSON.parse(msg.data.preference);
    dispatch({type: PreferenceTypes.RECEIVED_PREFERENCES, data: [preference]});

    if (addedNewDmUser(preference)) {
        loadProfilesForSidebar();
    }
}

function handlePreferencesChangedEvent(msg) {
    const preferences = JSON.parse(msg.data.preferences);
    dispatch({type: PreferenceTypes.RECEIVED_PREFERENCES, data: preferences});

    if (preferences.findIndex(addedNewDmUser) !== -1) {
        loadProfilesForSidebar();
    }
}

function handlePreferencesDeletedEvent(msg) {
    const preferences = JSON.parse(msg.data.preferences);
    dispatch({type: PreferenceTypes.DELETED_PREFERENCES, data: preferences});
}

function addedNewDmUser(preference) {
    return preference.category === Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW && preference.value === 'true';
}

export function handleUserTypingEvent(msg) {
    return (doDispatch, doGetState) => {
        const state = doGetState();
        const config = getConfig(state);
        const currentUserId = getCurrentUserId(state);
        const userId = msg.data.user_id;

        const data = {
            id: msg.broadcast.channel_id + msg.data.parent_id,
            userId,
            now: Date.now(),
        };

        doDispatch({
            type: WebsocketEvents.TYPING,
            data,
        });

        setTimeout(() => {
            doDispatch({
                type: WebsocketEvents.STOP_TYPING,
                data,
            });
        }, parseInt(config.TimeBetweenUserTypingUpdatesMilliseconds, 10));

        if (userId !== currentUserId) {
            doDispatch(getMissingProfilesByIds([userId]));
        }

        const status = getStatusForUserId(state, userId);
        if (status !== General.ONLINE) {
            doDispatch(getStatusesByIds([userId]));
        }
    };
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

export function handlePluginEnabled(msg) {
    const manifest = msg.data.manifest;
    loadPlugin(manifest).catch((error) => {
        console.error(error.message); //eslint-disable-line no-console
    });
}

export function handlePluginDisabled(msg) {
    const manifest = msg.data.manifest;
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

function handleOpenDialogEvent(msg) {
    const data = (msg.data && msg.data.dialog) || {};
    const dialog = JSON.parse(data);

    store.dispatch({type: IntegrationTypes.RECEIVED_DIALOG, data: dialog});

    const currentTriggerId = getState().entities.integrations.dialogTriggerId;

    if (dialog.trigger_id !== currentTriggerId) {
        return;
    }

    store.dispatch(openModal({modalId: ModalIdentifiers.INTERACTIVE_DIALOG, dialogType: InteractiveDialog}));
}
