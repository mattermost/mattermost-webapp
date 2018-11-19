// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import debounce from 'lodash/debounce';

import {
    getChannel,
    createDirectChannel,
    getChannelByNameAndTeamName,
    getChannelStats,
    getMyChannelMember,
    joinChannel,
    markChannelAsRead,
    selectChannel,
} from 'mattermost-redux/actions/channels';
import {getPostThread} from 'mattermost-redux/actions/posts';
import {logout} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId, getTeam, getMyTeams, getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelStats, getCurrentChannelId, getChannelByName} from 'mattermost-redux/selectors/entities/channels';

import {browserHistory} from 'utils/browser_history';
import {loadChannelsForCurrentUser} from 'actions/channel_actions.jsx';
import {handleNewPost} from 'actions/post_actions.jsx';
import {stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded, loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {closeRightHandSide, closeMenu as closeRhsMenu, updateRhsState} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';
import * as WebsocketActions from 'actions/websocket_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import BrowserStore from 'stores/browser_store.jsx';
import store from 'stores/redux_store.jsx';
import LocalStorageStore from 'stores/local_storage_store';
import WebSocketClient from 'client/web_websocket_client.jsx';

import {ActionTypes, Constants, ErrorPageTypes, PostTypes, RHSStates} from 'utils/constants.jsx';
import EventTypes from 'utils/event_types.jsx';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import {equalServerVersions} from 'utils/server_version';

const dispatch = store.dispatch;
const getState = store.getState;

export function emitChannelClickEvent(channel) {
    async function userVisitedFakeChannel(chan, success, fail) {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const otherUserId = Utils.getUserIdFromChannelName(chan);
        const {data: receivedChannel} = await createDirectChannel(currentUserId, otherUserId)(dispatch, getState);
        if (receivedChannel) {
            success(receivedChannel);
        } else {
            fail();
        }
    }
    function switchToChannel(chan) {
        const state = getState();
        const getMyChannelMemberPromise = dispatch(getMyChannelMember(chan.id));
        const oldChannelId = getCurrentChannelId(state);
        const userId = getCurrentUserId(state);
        const teamId = chan.team_id || getCurrentTeamId(state);
        const isRHSOpened = getIsRhsOpen(state);
        const isPinnedPostsShowing = getRhsState(state) === RHSStates.PIN;

        getMyChannelMemberPromise.then(() => {
            dispatch(getChannelStats(chan.id));

            // Mark previous and next channel as read
            dispatch(markChannelAsRead(chan.id, oldChannelId));
            reloadIfServerVersionChanged();
        });

        if (chan.delete_at === 0) {
            const penultimate = LocalStorageStore.getPreviousChannelName(userId, teamId);
            LocalStorageStore.setPenultimateChannelName(userId, teamId, penultimate);
            LocalStorageStore.setPreviousChannelName(userId, teamId, chan.name);
        }

        // When switching to a different channel if the pinned posts is showing
        // Update the RHS state to reflect the pinned post of the selected channel
        if (isRHSOpened && isPinnedPostsShowing) {
            dispatch(updateRhsState(RHSStates.PIN, chan.id));
        }

        loadProfilesForSidebar();

        AppDispatcher.handleViewAction({
            type: ActionTypes.CLICK_CHANNEL,
            id: chan.id,
            team_id: teamId,
        });
    }

    if (channel.fake) {
        userVisitedFakeChannel(
            channel,
            (data) => {
                switchToChannel(data);
            },
            () => {
                browserHistory.push('/' + this.state.currentTeam.name);
            }
        );
    } else {
        switchToChannel(channel);
    }
}

export async function doFocusPost(channelId, postId) {
    dispatch(selectChannel(channelId));
    dispatch({
        type: ActionTypes.RECEIVED_FOCUSED_POST,
        data: postId,
    });

    const member = getState().entities.channels.myMembers[channelId];
    if (member == null) {
        await dispatch(joinChannel(getCurrentUserId(getState()), null, channelId));
    }

    dispatch(loadChannelsForCurrentUser());
    dispatch(getChannelStats(channelId));
}

export function emitCloseRightHandSide() {
    dispatch(closeRightHandSide());
}

export async function emitPostFocusEvent(postId, returnTo = '') {
    dispatch(loadChannelsForCurrentUser());
    const {data} = await dispatch(getPostThread(postId));

    if (!data) {
        browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
        return;
    }

    const channelId = data.posts[data.order[0]].channel_id;
    let channel = getState().entities.channels.channels[channelId];
    const teamId = getCurrentTeamId(getState());

    if (!channel) {
        const {data: channelData} = await dispatch(getChannel(channelId));
        if (!channelData) {
            browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
            return;
        }
        channel = channelData;
    }

    if (channel.team_id && channel.team_id !== teamId) {
        browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
        return;
    }

    if (channel && channel.type === Constants.DM_CHANNEL) {
        loadNewDMIfNeeded(channel.id);
    } else if (channel && channel.type === Constants.GM_CHANNEL) {
        loadNewGMIfNeeded(channel.id);
    }

    await doFocusPost(channelId, postId, data);
}

export function emitUserPostedEvent(post) {
    AppDispatcher.handleServerAction({
        type: ActionTypes.CREATE_POST,
        post,
    });
}

export function emitUserCommentedEvent(post) {
    AppDispatcher.handleServerAction({
        type: ActionTypes.CREATE_COMMENT,
        post,
    });
}

export function toggleShortcutsModal() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_SHORTCUTS_MODAL,
        value: true,
    });
}

export function showChannelPurposeUpdateModal(channel) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_CHANNEL_PURPOSE_UPDATE_MODAL,
        value: true,
        channel,
    });
}

export function showChannelNameUpdateModal(channel) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_CHANNEL_NAME_UPDATE_MODAL,
        value: true,
        channel,
    });
}

export function showGetPostLinkModal(post) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_GET_POST_LINK_MODAL,
        value: true,
        post,
    });
}

export function showGetPublicLinkModal(fileId) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_GET_PUBLIC_LINK_MODAL,
        value: true,
        fileId,
    });
}

export function showGetTeamInviteLinkModal() {
    AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.TOGGLE_GET_TEAM_INVITE_LINK_MODAL,
        value: true,
    });
}

export function showLeavePrivateChannelModal(channel) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_LEAVE_PRIVATE_CHANNEL_MODAL,
        value: channel,
    });
}

export function emitSuggestionPretextChanged(suggestionId, pretext) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SUGGESTION_PRETEXT_CHANGED,
        id: suggestionId,
        pretext,
    });
}

export function emitSelectNextSuggestion(suggestionId) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SUGGESTION_SELECT_NEXT,
        id: suggestionId,
    });
}

export function emitSelectPreviousSuggestion(suggestionId) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.SUGGESTION_SELECT_PREVIOUS,
        id: suggestionId,
    });
}

export function emitCompleteWordSuggestion(suggestionId, term = '') {
    AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.SUGGESTION_COMPLETE_WORD,
        id: suggestionId,
        term,
    });
}

export function emitClearSuggestions(suggestionId) {
    AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.SUGGESTION_CLEAR_SUGGESTIONS,
        id: suggestionId,
    });
}

export function emitPreferenceChangedEvent(preference) {
    AppDispatcher.handleServerAction({
        type: Constants.ActionTypes.RECEIVED_PREFERENCE,
        preference,
    });

    if (addedNewDmUser(preference)) {
        loadProfilesForSidebar();
    }
}

export function emitPreferencesChangedEvent(preferences) {
    AppDispatcher.handleServerAction({
        type: Constants.ActionTypes.RECEIVED_PREFERENCES,
        preferences,
    });

    if (preferences.findIndex(addedNewDmUser) !== -1) {
        loadProfilesForSidebar();
    }
}

function addedNewDmUser(preference) {
    return preference.category === Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW && preference.value === 'true';
}

export function emitPreferencesDeletedEvent(preferences) {
    AppDispatcher.handleServerAction({
        type: Constants.ActionTypes.DELETED_PREFERENCES,
        preferences,
    });
}

export function sendEphemeralPost(message, channelId, parentId) {
    const timestamp = Utils.getTimestamp();
    const post = {
        id: Utils.generateId(),
        user_id: '0',
        channel_id: channelId || getCurrentChannelId(getState()),
        message,
        type: PostTypes.EPHEMERAL,
        create_at: timestamp,
        update_at: timestamp,
        root_id: parentId,
        parent_id: parentId,
        props: {},
    };

    dispatch(handleNewPost(post));
}

export function sendAddToChannelEphemeralPost(user, addedUsername, addedUserId, channelId, postRootId = '', timestamp) {
    const post = {
        id: Utils.generateId(),
        user_id: user.id,
        channel_id: channelId || getCurrentChannelId(getState()),
        message: '',
        type: PostTypes.EPHEMERAL_ADD_TO_CHANNEL,
        create_at: timestamp,
        update_at: timestamp,
        root_id: postRootId,
        parent_id: postRootId,
        props: {
            username: user.username,
            addedUsername,
            addedUserId,
        },
    };

    dispatch(handleNewPost(post));
}

let lastTimeTypingSent = 0;
export function emitLocalUserTypingEvent(channelId, parentPostId) {
    const userTyping = async (actionDispatch, actionGetState) => {
        const state = actionGetState();
        const config = getConfig(state);
        const t = Date.now();
        const stats = getCurrentChannelStats(state);
        const membersInChannel = stats ? stats.member_count : 0;

        if (((t - lastTimeTypingSent) > config.TimeBetweenUserTypingUpdatesMilliseconds) &&
            (membersInChannel < config.MaxNotificationsPerChannel) && (config.EnableUserTypingMessages === 'true')) {
            WebSocketClient.userTyping(channelId, parentPostId);
            lastTimeTypingSent = t;
        }

        return {data: true};
    };

    return dispatch(userTyping);
}

export function emitRemoteUserTypingEvent(channelId, userId, postParentId) {
    AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.USER_TYPING,
        channelId,
        userId,
        postParentId,
    });
}

export function emitUserLoggedOutEvent(redirectTo = '/', shouldSignalLogout = true, userAction = true) {
    // If the logout was intentional, discard knowledge about having previously been logged in.
    // This bit is otherwise used to detect session expirations on the login page.
    if (userAction) {
        LocalStorageStore.setWasLoggedIn(false);
    }

    dispatch(logout()).then(() => {
        if (shouldSignalLogout) {
            BrowserStore.signalLogout();
        }

        BrowserStore.clear();
        stopPeriodicStatusUpdates();
        WebsocketActions.close();
        document.cookie = 'MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        browserHistory.push(redirectTo);
    }).catch(() => {
        browserHistory.push(redirectTo);
    });
}

export function toggleSideBarRightMenuAction() {
    dispatch(closeRightHandSide());
    dispatch(closeLhs());
    dispatch(closeRhsMenu());
}

export function emitBrowserFocus(focus) {
    dispatch({
        type: ActionTypes.BROWSER_CHANGE_FOCUS,
        focus,
    });
}

export async function redirectUserToDefaultTeam() {
    const state = getState();
    const userId = getCurrentUserId(state);
    const locale = getCurrentLocale(state);
    const teamId = LocalStorageStore.getPreviousTeamId(userId);

    let team = getTeam(state, teamId);
    const myMember = getMyTeamMember(state, teamId);

    if (!team || !myMember || !myMember.team_id) {
        team = null;
        let myTeams = getMyTeams(state);

        if (myTeams.length > 0) {
            myTeams = filterAndSortTeamsByDisplayName(myTeams, locale);
            if (myTeams && myTeams[0]) {
                team = myTeams[0];
            }
        }
    }

    if (userId && team) {
        let channelName = LocalStorageStore.getPreviousChannelName(userId, teamId);
        const channel = getChannelByName(state, channelName);
        if (channel && channel.team_id === team.id) {
            dispatch(selectChannel(channel.id));
            channelName = channel.name;
        } else {
            const {data} = await dispatch(getChannelByNameAndTeamName(team.name, channelName));
            if (data) {
                dispatch(selectChannel(data.id));
            }
        }

        browserHistory.push(`/${team.name}/channels/${channelName}`);
    } else {
        browserHistory.push('/select_team');
    }
}

export const postListScrollChange = debounce(() => {
    AppDispatcher.handleViewAction({
        type: EventTypes.POST_LIST_SCROLL_CHANGE,
        value: false,
    });
});

export function postListScrollChangeToBottom() {
    AppDispatcher.handleViewAction({
        type: EventTypes.POST_LIST_SCROLL_CHANGE,
        value: true,
    });
}

let serverVersion = '';

export function reloadIfServerVersionChanged() {
    const newServerVersion = Client4.getServerVersion();

    if (serverVersion && !equalServerVersions(serverVersion, newServerVersion)) {
        console.log(`Detected version update from ${serverVersion} to ${newServerVersion}; refreshing the page`); //eslint-disable-line no-console
        window.location.reload(true);
    }

    serverVersion = newServerVersion;
}
