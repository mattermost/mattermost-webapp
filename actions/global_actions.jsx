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
import {getFilePublicLink} from 'mattermost-redux/actions/files';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId, getMyTeams, getTeam, getMyTeamMember, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelStats, getCurrentChannelId, getMyChannelMember, getRedirectChannelNameForTeam, getChannelsNameMapInTeam} from 'mattermost-redux/selectors/entities/channels';
import {ChannelTypes} from 'mattermost-redux/action_types';

import {browserHistory} from 'utils/browser_history';
import {handleNewPost} from 'actions/post_actions.jsx';
import {stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {closeRightHandSide, closeMenu as closeRhsMenu, updateRhsState} from 'actions/views/rhs';
import {clearUserCookie} from 'actions/views/cookie';
import {close as closeLhs} from 'actions/views/lhs';
import * as WebsocketActions from 'actions/websocket_actions.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import BrowserStore from 'stores/browser_store.jsx';
import LocalStorageStore from 'stores/local_storage_store';
import WebSocketClient from 'client/web_websocket_client.jsx';

import {ActionTypes, PostTypes, RHSStates, ModalIdentifiers} from 'utils/constants';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import SubMenuModal from 'components/widgets/menu/menu_modals/submenu_modal/submenu_modal';
import ShortcutsModal from 'components/shortcuts_modal';
import GetPublicLinkModal from 'components/get_public_link_modal';
import LeavePrivateChannelModal from 'components/leave_private_channel_modal';

import {openModal} from './views/modals';

export function channelClicked(channel) {
    return (dispatch, getState) => {
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
    };
}

export function showShortcutsModal() {
    return (dispatch) => {
        const shortcutsModalData = {
            modalId: ModalIdentifiers.SHORTCUTS,
            dialogType: ShortcutsModal,
            dialogProps: {
                isMac: Utils.isMac(),
            },
        };

        dispatch(openModal(shortcutsModalData));
    };
}

export function showGetPublicLinkModal(fileId) {
    return async (dispatch) => {
        await dispatch(getFilePublicLink(fileId));
        const publicLinkModalData = {
            modalId: ModalIdentifiers.GET_PUBLIC_LINK,
            dialogType: GetPublicLinkModal,
            dialogProps: {
                fileId,
            },
        };

        dispatch(openModal(publicLinkModalData));
    };
}

export function showLeavePrivateChannelModal(channel) {
    return (dispatch) => {
        const leavePrivateChannelModalData = {
            modalId: ModalIdentifiers.LEAVE_PRIVATE_CHANNEL,
            dialogType: LeavePrivateChannelModal,
            dialogProps: {
                channel,
            },
        };

        dispatch(openModal(leavePrivateChannelModalData));
    };
}

export function showMobileSubMenuModal(elements) {
    return (dispatch) => {
        const submenuModalData = {
            ModalId: ModalIdentifiers.MOBILE_SUBMENU,
            dialogType: SubMenuModal,
            dialogProps: {
                elements,
            },
        };

        dispatch(openModal(submenuModalData));
    };
}

export function sendEphemeralPost(message, channelId, parentId) {
    return (dispatch, getState) => {
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
    };
}

export function sendAddToChannelEphemeralPost(user, addedUsername, addedUserId, channelId, postRootId = '', timestamp) {
    return (dispatch, getState) => {
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
    };
}

let lastTimeTypingSent = 0;
export function sendLocalUserTyping(channelId, parentPostId) {
    return async (dispatch, getState) => {
        const state = getState();
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
}

export function logUserOut(redirectTo = '/', shouldSignalLogout = true, userAction = true) {
    return (dispatch) => {
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
    };
}

export function toggleSideBarRightMenuAction() {
    return (dispatch) => {
        dispatch(closeRightHandSide());
        dispatch(closeLhs());
        dispatch(closeRhsMenu());
    };
}

export function browserChangedFocus(focus) {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.BROWSER_CHANGE_FOCUS,
            focus,
        });
    };
}

async function getTeamRedirectChannelIfIsAccesible(dispatch, getState, user, team) {
    let state = getState();
    let channel = null;

    const myMember = getMyTeamMember(state, team.id);
    if (!myMember || Object.keys(myMember).length === 0) {
        return null;
    }

    let teamChannels = getChannelsNameMapInTeam(state, team.id);
    if (!teamChannels || Object.keys(teamChannels).length === 0) {
        // This should be executed in pretty limited scenarios (empty teams)
        await fetchMyChannelsAndMembers(team.id)(dispatch, getState); // eslint-disable-line no-await-in-loop
        state = getState();
        teamChannels = getChannelsNameMapInTeam(state, team.id);
    }

    let channelName = LocalStorageStore.getPreviousChannelName(user.id, team.id);
    channel = teamChannels[channelName];
    let channelMember = getMyChannelMember(state, channel && channel.id);

    if (!channel || !channelMember) {
        // This should be executed in pretty limited scenarios (when the last visited channel in the team has been removed)
        await getChannelByNameAndTeamName(team.name, channelName)(dispatch, getState); // eslint-disable-line no-await-in-loop
        state = getState();
        teamChannels = getChannelsNameMapInTeam(state, team.id);
        channel = teamChannels[channelName];
        channelMember = getMyChannelMember(state, channel && channel.id);
    }

    if (!channel || !channelMember) {
        channelName = getRedirectChannelNameForTeam(state, team.id);
        channel = teamChannels[channelName];
        channelMember = getMyChannelMember(state, channel && channel.id);
    }

    if (channel && channelMember) {
        return channel;
    }
    return null;
}

export function redirectUserToDefaultTeam() {
    return async (dispatch, getState) => {
        let state = getState();

        // Assume we need to load the user if they don't have any team memberships loaded or the user loaded
        let user = getCurrentUser(state);
        const shouldLoadUser = Utils.isEmptyObject(getTeamMemberships(state)) || !user;

        if (shouldLoadUser) {
            await dispatch(loadMe());
            state = getState();
            user = getCurrentUser(state);
        }

        if (!user) {
            return;
        }

        const locale = getCurrentLocale(state);
        const teamId = LocalStorageStore.getPreviousTeamId(user.id);

        let myTeams = getMyTeams(state);
        if (myTeams.length === 0) {
            browserHistory.push('/select_team');
            return;
        }

        const team = getTeam(state, teamId);
        if (team) {
            const channel = await getTeamRedirectChannelIfIsAccesible(dispatch, getState, user, team);
            if (channel) {
                dispatch(selectChannel(channel.id));
                browserHistory.push(`/${team.name}/channels/${channel.name}`);
                return;
            }
        }

        myTeams = filterAndSortTeamsByDisplayName(myTeams, locale);

        for (const myTeam of myTeams) {
            // This should execute async behavior in a pretty limited set of situations, so shouldn't be a problem
            const channel = await getTeamRedirectChannelIfIsAccesible(dispatch, getState, user, myTeam); // eslint-disable-line no-await-in-loop
            if (channel) {
                dispatch(selectChannel(channel.id));
                browserHistory.push(`/${myTeam.name}/channels/${channel.name}`);
                return;
            }
        }

        browserHistory.push('/select_team');
    };
}
