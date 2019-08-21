// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {
    createDirectChannel,
    getChannelByNameAndTeamName,
    getChannelStats,
    getMyChannelMember,
    markChannelAsRead,
    markChannelAsViewed,
    selectChannel,
} from 'mattermost-redux/actions/channels';
import {logout, loadMe} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId, getTeam, getMyTeams, getMyTeamMember, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelStats, getCurrentChannelId, getChannelByName, getMyChannelMember as selectMyChannelMember} from 'mattermost-redux/selectors/entities/channels';
import {ChannelTypes} from 'mattermost-redux/action_types';

import {browserHistory} from 'utils/browser_history';
import {handleNewPost} from 'actions/post_actions.jsx';
import {stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {closeRightHandSide, closeMenu as closeRhsMenu, updateRhsState} from 'actions/views/rhs';
import {clearUserCookie} from 'actions/views/root';
import {close as closeLhs} from 'actions/views/lhs';
import * as WebsocketActions from 'actions/websocket_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import BrowserStore from 'stores/browser_store.jsx';
import store from 'stores/redux_store.jsx';
import LocalStorageStore from 'stores/local_storage_store';
import WebSocketClient from 'client/web_websocket_client.jsx';

import {ActionTypes, Constants, PostTypes, RHSStates} from 'utils/constants.jsx';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';

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
        const member = selectMyChannelMember(state, chan.id);

        getMyChannelMemberPromise.then(() => {
            dispatch(getChannelStats(chan.id));

            // Mark previous and next channel as read
            dispatch(markChannelAsRead(chan.id, oldChannelId));
            dispatch(markChannelAsViewed(chan.id, oldChannelId));
        });

        if (chan.delete_at === 0) {
            const penultimate = LocalStorageStore.getPreviousChannelName(userId, teamId);
            if (penultimate !== chan.name) {
                LocalStorageStore.setPenultimateChannelName(userId, teamId, penultimate);
                LocalStorageStore.setPreviousChannelName(userId, teamId, chan.name);
            }
        }

        // When switching to a different channel if the pinned posts is showing
        // Update the RHS state to reflect the pinned post of the selected channel
        if (isRHSOpened && isPinnedPostsShowing) {
            dispatch(updateRhsState(RHSStates.PIN, chan.id));
        }

        loadProfilesForSidebar();

        dispatch(batchActions([{
            type: ChannelTypes.SELECT_CHANNEL,
            data: chan.id,
        }, {
            type: ActionTypes.SELECT_CHANNEL_WITH_MEMBER,
            data: chan.id,
            channel: chan,
            member: member || {},
        }]));
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

export function emitCloseRightHandSide() {
    dispatch(closeRightHandSide());
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

        clearUserCookie();

        browserHistory.push(redirectTo);
    }).catch(() => {
        browserHistory.push(redirectTo);
    });
}

export function toggleSideBarRightMenuAction() {
    return (doDispatch) => {
        doDispatch(closeRightHandSide());
        doDispatch(closeLhs());
        doDispatch(closeRhsMenu());
    };
}

export function emitBrowserFocus(focus) {
    dispatch({
        type: ActionTypes.BROWSER_CHANGE_FOCUS,
        focus,
    });
}

export async function redirectUserToDefaultTeam() {
    let state = getState();

    // Assume we need to load the user if they don't have any team memberships loaded
    const shouldLoadUser = Utils.isEmptyObject(getTeamMemberships(state));

    if (shouldLoadUser) {
        await dispatch(loadMe());
    }

    state = getState();

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
        let channelName = LocalStorageStore.getPreviousChannelName(userId, team.id);
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
    } else if (userId) {
        browserHistory.push('/select_team');
    }
}
