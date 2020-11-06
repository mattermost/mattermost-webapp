// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';
import {
    ChannelTypes,
    EmojiTypes,
    GroupTypes,
    PostTypes,
    TeamTypes,
    UserTypes,
    RoleTypes,
    GeneralTypes,
    AdminTypes,
    IntegrationTypes,
    PreferenceTypes,
} from 'mattermost-redux/action_types';
import {WebsocketEvents, General, Permissions} from 'mattermost-redux/constants';
import {addChannelToInitialCategory, fetchMyCategories, receivedCategoryOrder} from 'mattermost-redux/actions/channel_categories';
import {
    getChannelAndMyMember,
    getMyChannelMember,
    getChannelMember,
    getChannelStats,
    viewChannel,
    markChannelAsRead,
    getChannelMemberCountsByGroup,
} from 'mattermost-redux/actions/channels';
import {getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';
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
    getUser as loadUser,
} from 'mattermost-redux/actions/users';
import {removeNotVisibleUsers} from 'mattermost-redux/actions/websocket';
import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId, getStatusForUserId, getUser, getIsManualStatusForUserId, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getMyTeams, getCurrentRelativeTeamUrl, getCurrentTeamId, getCurrentTeamUrl, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getChannelsInTeam, getChannel, getCurrentChannel, getCurrentChannelId, getRedirectChannelNameForTeam, getMembersInCurrentChannel, getChannelMembersInChannels} from 'mattermost-redux/selectors/entities/channels';
import {getPost, getMostRecentPostIdInChannel} from 'mattermost-redux/selectors/entities/posts';
import {haveISystemPermission, haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getStandardAnalytics} from 'mattermost-redux/actions/admin';

import {getSelectedChannelId} from 'selectors/rhs';

import {openModal} from 'actions/views/modals';
import {incrementWsErrorCount, resetWsErrorCount} from 'actions/views/system';
import {closeRightHandSide} from 'actions/views/rhs';
import {syncPostsInChannel} from 'actions/views/channel';

import {browserHistory} from 'utils/browser_history';
import {loadChannelsForCurrentUser} from 'actions/channel_actions.jsx';
import {redirectUserToDefaultTeam} from 'actions/global_actions.jsx';
import {handleNewPost} from 'actions/post_actions.jsx';
import * as StatusActions from 'actions/status_actions.jsx';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import store from 'stores/redux_store.jsx';
import WebSocketClient from 'client/web_websocket_client.jsx';
import {loadPlugin, loadPluginsIfNecessary, removePlugin} from 'plugins';
import {ActionTypes, Constants, AnnouncementBarMessages, SocketEvents, UserStatuses, ModalIdentifiers, WarnMetricTypes} from 'utils/constants';
import {getSiteURL} from 'utils/url';
import {isGuest} from 'utils/utils';
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
        SYNC_INTERVAL_MILLISECONDS,
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

    case SocketEvents.POST_UNREAD:
        handlePostUnreadEvent(msg);
        break;

    case SocketEvents.LEAVE_TEAM:
        handleLeaveTeamEvent(msg);
        break;

    case SocketEvents.UPDATE_TEAM:
        handleUpdateTeamEvent(msg);
        break;

    case SocketEvents.UPDATE_TEAM_SCHEME:
        handleUpdateTeamSchemeEvent(msg);
        break;

    case SocketEvents.DELETE_TEAM:
        handleDeleteTeamEvent(msg);
        break;

    case SocketEvents.ADDED_TO_TEAM:
        handleTeamAddedEvent(msg);
        break;

    case SocketEvents.USER_ADDED:
        dispatch(handleUserAddedEvent(msg));
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

    case SocketEvents.CHANNEL_SCHEME_UPDATED:
        handleChannelSchemeUpdatedEvent(msg);
        break;

    case SocketEvents.MEMBERROLE_UPDATED:
        handleUpdateMemberRoleEvent(msg);
        break;

    case SocketEvents.ROLE_UPDATED:
        handleRoleUpdatedEvent(msg);
        break;

    case SocketEvents.CHANNEL_CREATED:
        dispatch(handleChannelCreatedEvent(msg));
        break;

    case SocketEvents.CHANNEL_DELETED:
        handleChannelDeletedEvent(msg);
        break;

    case SocketEvents.CHANNEL_UNARCHIVED:
        handleChannelUnarchivedEvent(msg);
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
        dispatch(handleDirectAddedEvent(msg));
        break;

    case SocketEvents.GROUP_ADDED:
        dispatch(handleGroupAddedEvent(msg));
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

    case SocketEvents.RECEIVED_GROUP:
        handleGroupUpdatedEvent(msg);
        break;

    case SocketEvents.RECEIVED_GROUP_ASSOCIATED_TO_TEAM:
        handleGroupAssociatedToTeamEvent(msg);
        break;

    case SocketEvents.RECEIVED_GROUP_NOT_ASSOCIATED_TO_TEAM:
        handleGroupNotAssociatedToTeamEvent(msg);
        break;

    case SocketEvents.RECEIVED_GROUP_ASSOCIATED_TO_CHANNEL:
        handleGroupAssociatedToChannelEvent(msg);
        break;

    case SocketEvents.RECEIVED_GROUP_NOT_ASSOCIATED_TO_CHANNEL:
        handleGroupNotAssociatedToChannelEvent(msg);
        break;

    case SocketEvents.WARN_METRIC_STATUS_RECEIVED:
        handleWarnMetricStatusReceivedEvent(msg);
        break;

    case SocketEvents.WARN_METRIC_STATUS_REMOVED:
        handleWarnMetricStatusRemovedEvent(msg);
        break;

    case SocketEvents.SIDEBAR_CATEGORY_CREATED:
        dispatch(handleSidebarCategoryCreated(msg));
        break;

    case SocketEvents.SIDEBAR_CATEGORY_UPDATED:
        dispatch(handleSidebarCategoryUpdated(msg));
        break;

    case SocketEvents.SIDEBAR_CATEGORY_DELETED:
        dispatch(handleSidebarCategoryDeleted(msg));
        break;
    case SocketEvents.SIDEBAR_CATEGORY_ORDER_UPDATED:
        dispatch(handleSidebarCategoryOrderUpdated(msg));
        break;
    case SocketEvents.USER_ACTIVATION_STATUS_CHANGED:
        dispatch(handleUserActivationStatusChange());
        break;
    case SocketEvents.CLOUD_PAYMENT_STATUS_UPDATED:
        dispatch(handleCloudPaymentStatusUpdated(msg));
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
    const roles = channelMember.roles.split(' ');
    dispatch(loadRolesIfNeeded(roles));
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
        if (timeout && count > 4) {
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

        // Since status updates aren't real time, assume another user is online if they have posted and:
        // 1. The user hasn't set their status manually to something that isn't online
        // 2. The server hasn't told the client not to set the user to online. This happens when:
        //     a. The post is from the auto responder
        //     b. The post is a response to a push notification
        if (
            post.user_id !== getCurrentUserId(myGetState()) &&
            !getIsManualStatusForUserId(myGetState(), post.user_id) &&
            msg.data.set_online
        ) {
            myDispatch({
                type: UserTypes.RECEIVED_STATUSES,
                data: [{user_id: post.user_id, status: UserStatuses.ONLINE}],
            });
        }
    };
}

export function handleNewPostEvents(queue) {
    return (myDispatch, myGetState) => {
        // Note that this method doesn't properly update the sidebar state for these posts
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
        dispatch(getChannelStats(currentChannelId));
        if (window.isActive) {
            dispatch(viewChannel(currentChannelId));
        }
    }
}

function handlePostDeleteEvent(msg) {
    const post = JSON.parse(msg.data.post);
    dispatch(postDeleted(post));
    if (post.is_pinned) {
        dispatch(getChannelStats(post.channel_id));
    }
}

export function handlePostUnreadEvent(msg) {
    dispatch(
        {
            type: ActionTypes.POST_UNREAD_SUCCESS,
            data: {
                lastViewedAt: msg.data.last_viewed_at,
                channelId: msg.broadcast.channel_id,
                msgCount: msg.data.msg_count,
                mentionCount: msg.data.mention_count,
            },
        },
    );
}

async function handleTeamAddedEvent(msg) {
    await dispatch(TeamActions.getTeam(msg.data.team_id));
    await dispatch(TeamActions.getMyTeamMembers());
    await dispatch(TeamActions.getMyTeamUnreads());
}

export function handleLeaveTeamEvent(msg) {
    const state = getState();

    const actions = [
        {
            type: UserTypes.RECEIVED_PROFILE_NOT_IN_TEAM,
            data: {id: msg.data.team_id, user_id: msg.data.user_id},
        },
        {
            type: TeamTypes.REMOVE_MEMBER_FROM_TEAM,
            data: {team_id: msg.data.team_id, user_id: msg.data.user_id},
        },
    ];

    const channelsPerTeam = getChannelsInTeam(state);
    const channels = (channelsPerTeam && channelsPerTeam[msg.data.team_id]) || [];

    for (const channel of channels) {
        actions.push({
            type: ChannelTypes.REMOVE_MEMBER_FROM_CHANNEL,
            data: {id: channel, user_id: msg.data.user_id},
        });
    }

    dispatch(batchActions(actions));
    const currentUser = getCurrentUser(state);

    if (currentUser.id === msg.data.user_id) {
        dispatch({type: TeamTypes.LEAVE_TEAM, data: {id: msg.data.team_id}});

        // if they are on the team being removed redirect them to default team
        if (getCurrentTeamId(state) === msg.data.team_id) {
            if (!global.location.pathname.startsWith('/admin_console')) {
                redirectUserToDefaultTeam();
            }
        }
        if (isGuest(currentUser)) {
            dispatch(removeNotVisibleUsers());
        }
    } else {
        const team = getTeam(state, msg.data.team_id);
        const members = getChannelMembersInChannels(state);
        const isMember = Object.values(members).some((member) => member[msg.data.user_id]);
        if (team && isGuest(currentUser) && !isMember) {
            dispatch(batchActions([
                {
                    type: UserTypes.PROFILE_NO_LONGER_VISIBLE,
                    data: {user_id: msg.data.user_id},
                },
                {
                    type: TeamTypes.REMOVE_MEMBER_FROM_TEAM,
                    data: {team_id: team.id, user_id: msg.data.user_id},
                },
            ]));
        }
    }
}

function handleUpdateTeamEvent(msg) {
    dispatch({type: TeamTypes.UPDATED_TEAM, data: JSON.parse(msg.data.team)});
}

function handleUpdateTeamSchemeEvent() {
    dispatch(TeamActions.getMyTeamMembers());
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
    const memberData = JSON.parse(msg.data.member);
    const newRoles = memberData.roles.split(' ');

    dispatch(loadRolesIfNeeded(newRoles));

    dispatch({
        type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
        data: memberData,
    });
}

function handleDirectAddedEvent(msg) {
    return fetchChannelAndAddToSidebar(msg.broadcast.channel_id);
}

function handleGroupAddedEvent(msg) {
    return fetchChannelAndAddToSidebar(msg.broadcast.channel_id);
}

function handleUserAddedEvent(msg) {
    return async (doDispatch, doGetState) => {
        const state = doGetState();
        const config = getConfig(state);
        const license = getLicense(state);
        const isTimezoneEnabled = config.ExperimentalTimezone === 'true';
        const currentChannelId = getCurrentChannelId(state);
        if (currentChannelId === msg.broadcast.channel_id) {
            doDispatch(getChannelStats(currentChannelId));
            doDispatch({
                type: UserTypes.RECEIVED_PROFILE_IN_CHANNEL,
                data: {id: msg.broadcast.channel_id, user_id: msg.data.user_id},
            });
            if (license?.IsLicensed === 'true' && license?.LDAPGroups === 'true') {
                doDispatch(getChannelMemberCountsByGroup(currentChannelId, isTimezoneEnabled));
            }
        }

        // Load the channel so that it appears in the sidebar
        const currentTeamId = getCurrentTeamId(doGetState());
        const currentUserId = getCurrentUserId(doGetState());
        if (currentTeamId === msg.data.team_id && currentUserId === msg.data.user_id) {
            doDispatch(fetchChannelAndAddToSidebar(msg.broadcast.channel_id));
        }

        // This event is fired when a user first joins the server, so refresh analytics to see if we're now over the user limit
        if (license.Cloud === 'true' && isCurrentUserSystemAdmin(doGetState())) {
            doDispatch(getStandardAnalytics());
        }
    };
}

function fetchChannelAndAddToSidebar(channelId) {
    return async (doDispatch) => {
        const {data, error} = await doDispatch(getChannelAndMyMember(channelId));

        if (!error) {
            doDispatch(addChannelToInitialCategory(data.channel));
        }
    };
}

export async function handleUserRemovedEvent(msg) {
    const state = getState();
    const currentChannel = getCurrentChannel(state) || {};
    const currentUser = getCurrentUser(state);
    const config = getConfig(state);
    const license = getLicense(state);
    const isTimezoneEnabled = config.ExperimentalTimezone === 'true';

    if (msg.broadcast.user_id === currentUser.id) {
        dispatch(loadChannelsForCurrentUser());

        const rhsChannelId = getSelectedChannelId(state);
        if (msg.data.channel_id === rhsChannelId) {
            dispatch(closeRightHandSide());
        }

        if (msg.data.channel_id === currentChannel.id) {
            if (msg.data.remover_id === msg.broadcast.user_id) {
                browserHistory.push(getCurrentRelativeTeamUrl(state));

                await dispatch({
                    type: ChannelTypes.LEAVE_CHANNEL,
                    data: {id: msg.data.channel_id, user_id: msg.broadcast.user_id},
                });
            } else {
                const user = getUser(state, msg.data.remover_id);
                if (!user) {
                    dispatch(loadUser(msg.data.remover_id));
                }

                dispatch(openModal({
                    modalId: ModalIdentifiers.REMOVED_FROM_CHANNEL,
                    dialogType: RemovedFromChannelModal,
                    dialogProps: {
                        channelName: currentChannel.display_name,
                        removerId: msg.data.remover_id,
                    },
                }));

                await dispatch({
                    type: ChannelTypes.LEAVE_CHANNEL,
                    data: {id: msg.data.channel_id, user_id: msg.broadcast.user_id},
                });

                redirectUserToDefaultTeam();
            }
        }

        if (isGuest(currentUser)) {
            dispatch(removeNotVisibleUsers());
        }
    } else if (msg.broadcast.channel_id === currentChannel.id) {
        dispatch(getChannelStats(currentChannel.id));
        dispatch({
            type: UserTypes.RECEIVED_PROFILE_NOT_IN_CHANNEL,
            data: {id: msg.broadcast.channel_id, user_id: msg.data.user_id},
        });
        if (license?.IsLicensed === 'true' && license?.LDAPGroups === 'true') {
            dispatch(getChannelMemberCountsByGroup(currentChannel.id, isTimezoneEnabled));
        }
    }

    if (msg.broadcast.user_id !== currentUser.id) {
        const channel = getChannel(state, msg.broadcast.channel_id);
        const members = getChannelMembersInChannels(state);
        const isMember = Object.values(members).some((member) => member[msg.data.user_id]);
        if (channel && isGuest(currentUser) && !isMember) {
            const actions = [
                {
                    type: UserTypes.PROFILE_NO_LONGER_VISIBLE,
                    data: {user_id: msg.data.user_id},
                },
                {
                    type: TeamTypes.REMOVE_MEMBER_FROM_TEAM,
                    data: {team_id: channel.team_id, user_id: msg.data.user_id},
                },
            ];
            dispatch(batchActions(actions));
        }
    }

    const channelId = msg.broadcast.channel_id || msg.data.channel_id;
    const userId = msg.broadcast.user_id || msg.data.user_id;
    const channel = getChannel(state, channelId);
    if (channel && !haveISystemPermission(state, {permission: Permissions.VIEW_MEMBERS}) && !haveITeamPermission(state, {permission: Permissions.VIEW_MEMBERS, team: channel.team_id})) {
        dispatch(batchActions([
            {
                type: UserTypes.RECEIVED_PROFILE_NOT_IN_TEAM,
                data: {id: channel.team_id, user_id: userId},
            },
            {
                type: TeamTypes.REMOVE_MEMBER_FROM_TEAM,
                data: {team_id: channel.team_id, user_id: userId},
            },
        ]));
    }
}

export async function handleUserUpdatedEvent(msg) {
    const state = getState();
    const currentUser = getCurrentUser(state);
    const user = msg.data.user;

    const config = getConfig(state);
    const license = getLicense(state);

    const userIsGuest = isGuest(user);
    const isTimezoneEnabled = config.ExperimentalTimezone === 'true';
    const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';

    if (userIsGuest || (isTimezoneEnabled && isLDAPEnabled)) {
        let members = getMembersInCurrentChannel(state);
        const currentChannelId = getCurrentChannelId(state);
        let memberExists = members && members[user.id];
        if (!memberExists) {
            await dispatch(getChannelMember(currentChannelId, user.id));
            members = getMembersInCurrentChannel(getState());
            memberExists = members && members[user.id];
        }

        if (memberExists) {
            if (isLDAPEnabled && isTimezoneEnabled) {
                dispatch(getChannelMemberCountsByGroup(currentChannelId, true));
            }
            if (isGuest(user)) {
                dispatch(getChannelStats(currentChannelId));
            }
        }
    }

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

function handleChannelSchemeUpdatedEvent(msg) {
    dispatch(getMyChannelMember(msg.broadcast.channel_id));
}

function handleRoleUpdatedEvent(msg) {
    const role = JSON.parse(msg.data.role);

    dispatch({
        type: RoleTypes.RECEIVED_ROLE,
        data: role,
    });
}

function handleChannelCreatedEvent(msg) {
    return async (myDispatch, myGetState) => {
        const channelId = msg.data.channel_id;
        const teamId = msg.data.team_id;
        const state = myGetState();

        if (getCurrentTeamId(state) === teamId) {
            let channel = getChannel(state, channelId);

            if (!channel) {
                await myDispatch(getChannelAndMyMember(channelId));

                channel = getChannel(myGetState(), channelId);
            }

            myDispatch(addChannelToInitialCategory(channel, false));
        }
    };
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

function handleChannelUnarchivedEvent(msg) {
    const state = getState();
    const config = getConfig(state);
    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

    dispatch({type: ChannelTypes.RECEIVED_CHANNEL_UNARCHIVED, data: {id: msg.data.channel_id, team_id: msg.broadcast.team_id, viewArchivedChannels}});
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
    return async (doDispatch, doGetState) => {
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
            const result = await doDispatch(getMissingProfilesByIds([userId]));
            if (result.data && result.data.length > 0) {
                // Already loaded the user status
                return;
            }
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
        const newRoles = roles.split(' ');
        const demoted = user.roles.includes(Constants.PERMISSIONS_SYSTEM_ADMIN) && !roles.includes(Constants.PERMISSIONS_SYSTEM_ADMIN);

        store.dispatch({type: UserTypes.RECEIVED_PROFILE, data: {...user, roles}});
        dispatch(loadRolesIfNeeded(newRoles));

        if (demoted && global.location.pathname.startsWith('/admin_console')) {
            redirectUserToDefaultTeam();
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

function handleGroupUpdatedEvent(msg) {
    const data = JSON.parse(msg.data.group);
    dispatch(batchActions([
        {
            type: GroupTypes.RECEIVED_GROUP,
            data,
        },
        {
            type: GroupTypes.RECEIVED_MY_GROUPS,
            data: [data],
        },
    ]));
}

function handleGroupAssociatedToTeamEvent(msg) {
    store.dispatch({
        type: GroupTypes.RECEIVED_GROUP_ASSOCIATED_TO_TEAM,
        data: {teamID: msg.broadcast.team_id, groups: [{id: msg.data.group_id}]},
    });
}

function handleGroupNotAssociatedToTeamEvent(msg) {
    store.dispatch({
        type: GroupTypes.RECEIVED_GROUP_NOT_ASSOCIATED_TO_TEAM,
        data: {teamID: msg.broadcast.team_id, groups: [{id: msg.data.group_id}]},
    });
}

function handleGroupAssociatedToChannelEvent(msg) {
    store.dispatch({
        type: GroupTypes.RECEIVED_GROUP_ASSOCIATED_TO_CHANNEL,
        data: {channelID: msg.broadcast.channel_id, groups: [{id: msg.data.group_id}]},
    });
}

function handleGroupNotAssociatedToChannelEvent(msg) {
    store.dispatch({
        type: GroupTypes.RECEIVED_GROUP_NOT_ASSOCIATED_TO_CHANNEL,
        data: {channelID: msg.broadcast.channel_id, groups: [{id: msg.data.group_id}]},
    });
}

function handleWarnMetricStatusReceivedEvent(msg) {
    var receivedData = JSON.parse(msg.data.warnMetricStatus);
    let bannerData;
    if (receivedData.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500) {
        bannerData = AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_USERS;
    } else if (receivedData.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_2M) {
        bannerData = AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_POSTS;
    }
    store.dispatch(batchActions([
        {
            type: GeneralTypes.WARN_METRIC_STATUS_RECEIVED,
            data: receivedData,
        },
        {
            type: ActionTypes.SHOW_NOTICE,
            data: [bannerData],
        },
    ]));
}

function handleWarnMetricStatusRemovedEvent(msg) {
    store.dispatch({type: GeneralTypes.WARN_METRIC_STATUS_REMOVED, data: {id: msg.data.warnMetricId}});
}

function handleSidebarCategoryCreated(msg) {
    return (doDispatch, doGetState) => {
        const state = doGetState();

        if (msg.broadcast.team_id !== getCurrentTeamId(state)) {
            // The new category will be loaded when we switch teams.
            return;
        }

        // Fetch all categories, including ones that weren't explicitly updated, in case any other categories had channels
        // moved out of them.
        doDispatch(fetchMyCategories(msg.broadcast.team_id));
    };
}

function handleSidebarCategoryUpdated(msg) {
    return (doDispatch, doGetState) => {
        const state = doGetState();

        if (msg.broadcast.team_id !== getCurrentTeamId(state)) {
            // The updated categories will be loaded when we switch teams.
            return;
        }

        // Fetch all categories in case any other categories had channels moved out of them.
        doDispatch(fetchMyCategories(msg.broadcast.team_id));
    };
}

function handleSidebarCategoryDeleted(msg) {
    return (doDispatch, doGetState) => {
        const state = doGetState();

        if (msg.broadcast.team_id !== getCurrentTeamId(state)) {
            // The category will be removed when we switch teams.
            return;
        }

        // Fetch all categories since any channels that were in the deleted category were moved to other categories.
        doDispatch(fetchMyCategories(msg.broadcast.team_id));
    };
}

function handleSidebarCategoryOrderUpdated(msg) {
    return receivedCategoryOrder(msg.broadcast.team_id, msg.data.order);
}

function handleUserActivationStatusChange() {
    return (doDispatch, doGetState) => {
        const state = doGetState();
        const license = getLicense(state);

        // This event is fired when a user first joins the server, so refresh analytics to see if we're now over the user limit
        if (license.Cloud === 'true' && isCurrentUserSystemAdmin(state)
        ) {
            doDispatch(getStandardAnalytics());
        }
    };
}

function handleCloudPaymentStatusUpdated() {
    return (doDispatch) => doDispatch(getCloudSubscription());
}
