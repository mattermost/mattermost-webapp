// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {
    createDirectChannel,
    fetchMyChannelsAndMembers,
    getChannelByNameAndTeamName,
    getChannelStats,
    selectChannel,
} from 'mattermost-redux/actions/channels';
import {logout, loadMe} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId, getTeam, getMyTeams, getMyTeamMember, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelStats, getCurrentChannelId, getChannelByName, getMyChannelMember, getRedirectChannelNameForTeam, getChannelsNameMapInTeam} from 'mattermost-redux/selectors/entities/channels';
import {ChannelTypes} from 'mattermost-redux/action_types';

import {browserHistory} from 'utils/browser_history';
import {handleNewPost} from 'actions/post_actions.jsx';
import {stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {closeRightHandSide, closeMenu as closeRhsMenu, updateRhsState} from 'actions/views/rhs';
import {clearUserCookie} from 'actions/views/cookie';
import {close as closeLhs} from 'actions/views/lhs';
import * as WebsocketActions from 'actions/websocket_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import BrowserStore from 'stores/browser_store.jsx';
import store from 'stores/redux_store.jsx';
import LocalStorageStore from 'stores/local_storage_store';
import WebSocketClient from 'client/web_websocket_client.jsx';

import {ActionTypes, Constants, PostTypes, RHSStates, ModalIdentifiers} from 'utils/constants';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import SubMenuModal from '../components/widgets/menu/menu_modals/submenu_modal/submenu_modal';

import {openModal} from './views/modals';

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
        const userId = getCurrentUserId(state);
        const teamId = chan.team_id || getCurrentTeamId(state);
        const isRHSOpened = getIsRhsOpen(state);
        const isPinnedPostsShowing = getRhsState(state) === RHSStates.PIN;
        const member = getMyChannelMember(state, chan.id);

        dispatch(getChannelStats(chan.id));

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

export function showMobileSubMenuModal(elements) {
    const submenuModalData = {
        ModalId: ModalIdentifiers.MOBILE_SUBMENU,
        dialogType: SubMenuModal,
        dialogProps: {
            elements,
        },
    };

    dispatch(openModal(submenuModalData));
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

    const user = getCurrentUser(state);
    const locale = getCurrentLocale(state);
    const teamId = LocalStorageStore.getPreviousTeamId(user.id);

    let channel;
    let team;
    let myTeams = getMyTeams(state);

    if (myTeams.length === 0) {
        browserHistory.push('/select_team');
        return;
    }


    myTeams = filterAndSortTeamsByDisplayName(myTeams, locale);

    for (let myTeam of myTeams) {
        const myMember = getMyTeamMember(state, myTeam.id);
        if (!myMember) {
            continue;
        }

        if (user.id && myTeam) {
            if (user && Utils.isGuest(user)) {
                // This should be executed in pretty limited scenarios (guest with empty teams)
                await dispatch(fetchMyChannelsAndMembers(myTeam.id)); // eslint-disable-line no-await-in-loop
                state = getState();
            }

            let teamChannels = getChannelsNameMapInTeam(state, myTeam.id)
            let channelName = LocalStorageStore.getPreviousChannelName(user.id, myTeam.id);
            channel = teamChannels[channelName];
            let channelMember = getMyChannelMember(state, channel && channel.id)

            if (!channel || !channelMember) {
                // This should be executed in pretty limited scenarios (when the last visited channel in the team has been removed)
                await dispatch(getChannelByNameAndTeamName(myTeam.name, channelName)); // eslint-disable-line no-await-in-loop
                state = getState();
                let teamChannels = getChannelsNameMapInTeam(state, myTeam.id)
                channel = teamChannels[channelName];
                channelMember = getMyChannelMember(state, channel && channel.id)
            }

            if (!channel || !channelMember) {
                channelName = getRedirectChannelNameForTeam(state, myTeam.id);
                channel = teamChannels[channelName];
                channelMember = getMyChannelMember(state, channel && channel.id)
            }

            if (channel && channelMember) {
                team = myTeam;
                break;
            }
        }
    }

    if (team && channel) {
        dispatch(selectChannel(channel.id));
        browserHistory.push(`/${team.name}/channels/${channel.name}`);
    } else if (user.id) {
        browserHistory.push('/select_team');
    }
}
