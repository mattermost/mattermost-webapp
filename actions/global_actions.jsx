// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import debounce from 'lodash/debounce';

import {
    getChannel,
    createDirectChannel,
    getChannelByNameAndTeamName,
    getChannelAndMyMember,
    getChannelStats,
    getMyChannelMember,
    joinChannel,
    markChannelAsRead,
    selectChannel,
} from 'mattermost-redux/actions/channels';
import {getPostThread} from 'mattermost-redux/actions/posts';
import {removeUserFromTeam} from 'mattermost-redux/actions/teams';
import {Client4} from 'mattermost-redux/client';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelStats} from 'mattermost-redux/selectors/entities/channels';

import {browserHistory} from 'utils/browser_history';
import {loadChannelsForCurrentUser} from 'actions/channel_actions.jsx';
import {handleNewPost} from 'actions/post_actions.jsx';
import {stopPeriodicStatusUpdates} from 'actions/status_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded, loadProfilesForSidebar} from 'actions/user_actions.jsx';
import {closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';
import * as WebsocketActions from 'actions/websocket_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import BrowserStore from 'stores/browser_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import ErrorStore from 'stores/error_store.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebSocketClient from 'client/web_websocket_client.jsx';

import {ActionTypes, Constants, ErrorPageTypes, PostTypes} from 'utils/constants.jsx';
import EventTypes from 'utils/event_types.jsx';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import en from 'i18n/en.json';
import * as I18n from 'i18n/i18n.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export function emitChannelClickEvent(channel) {
    async function userVisitedFakeChannel(chan, success, fail) {
        const currentUserId = UserStore.getCurrentId();
        const otherUserId = Utils.getUserIdFromChannelName(chan);
        const {data: receivedChannel} = await createDirectChannel(currentUserId, otherUserId)(dispatch, getState);
        if (receivedChannel) {
            success(receivedChannel);
        } else {
            fail();
        }
    }
    function switchToChannel(chan) {
        const getMyChannelMemberPromise = getMyChannelMember(chan.id)(dispatch, getState);
        const oldChannelId = ChannelStore.getCurrentId();

        getMyChannelMemberPromise.then(() => {
            getChannelStats(chan.id)(dispatch, getState);

            // Mark previous and next channel as read
            dispatch(markChannelAsRead(chan.id, oldChannelId));
            reloadIfServerVersionChanged();
        });

        BrowserStore.setGlobalItem(Constants.PREV_CHANNEL_KEY + chan.team_id, chan.name);

        loadProfilesForSidebar();

        AppDispatcher.handleViewAction({
            type: ActionTypes.CLICK_CHANNEL,
            id: chan.id,
            team_id: chan.team_id,
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

export async function doFocusPost(channelId, postId, data) {
    AppDispatcher.handleServerAction({
        type: ActionTypes.RECEIVED_FOCUSED_POST,
        postId,
        channelId,
        post_list: data,
    });

    dispatch({
        type: ActionTypes.RECEIVED_FOCUSED_POST,
        data: postId,
    });

    const member = getState().entities.channels.myMembers[channelId];
    if (member == null) {
        await joinChannel(UserStore.getCurrentId(), null, channelId)(dispatch, getState);
    }

    loadChannelsForCurrentUser();
    getChannelStats(channelId)(dispatch, getState);
}

export function emitCloseRightHandSide() {
    dispatch(closeRightHandSide());
}

export async function emitPostFocusEvent(postId, returnTo = '') {
    loadChannelsForCurrentUser();
    const {data} = await dispatch(getPostThread(postId));

    if (!data) {
        browserHistory.push(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
        return;
    }

    const channelId = data.posts[data.order[0]].channel_id;
    let channel = getState().entities.channels.channels[channelId];
    const teamId = getCurrentTeamId(getState());

    if (!channel) {
        const {data: channelData} = await dispatch(getChannel(channelId));
        if (!channelData) {
            browserHistory.push(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
            return;
        }
        channel = channelData;
    }

    if (channel.team_id && channel.team_id !== teamId) {
        browserHistory.push(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
        return;
    }

    if (channel && channel.type === Constants.DM_CHANNEL) {
        loadNewDMIfNeeded(channel.id);
    } else if (channel && channel.type === Constants.GM_CHANNEL) {
        loadNewGMIfNeeded(channel.id);
    }

    await doFocusPost(channelId, postId, data);
}

export function emitLeaveTeam() {
    removeUserFromTeam(TeamStore.getCurrentId(), UserStore.getCurrentId())(dispatch, getState);
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

export function showAccountSettingsModal() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_ACCOUNT_SETTINGS_MODAL,
        value: true,
    });
}

export function toggleShortcutsModal() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_SHORTCUTS_MODAL,
        value: true,
    });
}

export function showChannelHeaderUpdateModal(channel) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_CHANNEL_HEADER_UPDATE_MODAL,
        value: true,
        channel,
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

export function showInviteMemberModal() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_INVITE_MEMBER_MODAL,
        value: true,
    });
}

export function showLeaveTeamModal() {
    AppDispatcher.handleViewAction({
        type: ActionTypes.TOGGLE_LEAVE_TEAM_MODAL,
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
        channel_id: channelId || ChannelStore.getCurrentId(),
        message,
        type: PostTypes.EPHEMERAL,
        create_at: timestamp,
        update_at: timestamp,
        root_id: parentId,
        parent_id: parentId,
        props: {},
    };

    handleNewPost(post);
}

export function sendAddToChannelEphemeralPost(user, addedUsername, addedUserId, channelId, postRootId = '', timestamp) {
    const post = {
        id: Utils.generateId(),
        user_id: user.id,
        channel_id: channelId || ChannelStore.getCurrentId(),
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

    handleNewPost(post);
}

export function newLocalizationSelected(locale) {
    const localeInfo = I18n.getLanguageInfo(locale);

    if (locale === 'en' || !localeInfo) {
        AppDispatcher.handleServerAction({
            type: ActionTypes.RECEIVED_LOCALE,
            locale,
            translations: en,
        });
    } else {
        Client4.getTranslations(localeInfo.url).then(
            (data, res) => {
                let translations = data;
                if (!data && res.text) {
                    translations = JSON.parse(res.text);
                }
                AppDispatcher.handleServerAction({
                    type: ActionTypes.RECEIVED_LOCALE,
                    locale,
                    translations,
                });
            }
        ).catch(
            () => {} //eslint-disable-line no-empty-function
        );
    }
}

export function loadCurrentLocale() {
    const user = UserStore.getCurrentUser();

    if (user && user.locale) {
        newLocalizationSelected(user.locale);
    } else {
        loadDefaultLocale();
    }
}

export function loadDefaultLocale() {
    const config = getConfig(getState());
    let locale = config.DefaultClientLocale;

    if (!I18n.getLanguageInfo(locale)) {
        locale = 'en';
    }

    return newLocalizationSelected(locale);
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

export function emitUserLoggedOutEvent(redirectTo = '/', shouldSignalLogout = true) {
    Client4.logout().then(
        () => {
            if (shouldSignalLogout) {
                BrowserStore.signalLogout();
            }

            clientLogout(redirectTo);
        }
    ).catch(
        () => {
            browserHistory.push(redirectTo);
        }
    );
}

export function clientLogout(redirectTo = '/') {
    BrowserStore.clear({exclude: [Constants.RECENT_EMOJI_KEY, '__landingPageSeen__', 'selected_teams']});
    ErrorStore.clearLastError();
    ChannelStore.clear();
    stopPeriodicStatusUpdates();
    WebsocketActions.close();
    document.cookie = 'MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    browserHistory.push(redirectTo);
}

export function toggleSideBarRightMenuAction() {
    dispatch(closeRightHandSide());
    dispatch(closeLhs());
    dispatch(closeRhsMenu());
}

export function emitBrowserFocus(focus) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.BROWSER_CHANGE_FOCUS,
        focus,
    });
}

export async function redirectUserToDefaultTeam() {
    const teams = TeamStore.getAll();
    const teamMembers = TeamStore.getMyTeamMembers();
    let teamId = BrowserStore.getGlobalItem('team');

    function redirect(teamName, channelName) {
        browserHistory.push(`/${teamName}/channels/${channelName}`);
    }

    if (!teams[teamId] && teamMembers.length > 0) {
        let myTeams = [];
        for (const index in teamMembers) {
            if (teamMembers.hasOwnProperty(index)) {
                const teamMember = teamMembers[index];
                myTeams.push(teams[teamMember.team_id]);
            }
        }

        if (myTeams.length > 0) {
            myTeams = filterAndSortTeamsByDisplayName(myTeams);
            if (myTeams && myTeams[0]) {
                teamId = myTeams[0].id;
            }
        }
    }

    const team = teams[teamId];
    if (team) {
        const channelId = BrowserStore.getGlobalItem(teamId);
        const channel = ChannelStore.getChannelById(channelId);
        let channelName = Constants.DEFAULT_CHANNEL;
        if (channel && channel.team_id === team.id) {
            dispatch(selectChannel(channel.id));
            channelName = channel.name;
        } else if (channelId) {
            const {data} = await getChannelAndMyMember(channelId)(dispatch, getState);
            if (data) {
                dispatch(selectChannel(channelId));
                channelName = data.channel.name;
            }
        } else {
            const {data} = await dispatch(getChannelByNameAndTeamName(team.name, channelName));
            if (data) {
                dispatch(selectChannel(data.id));
            }
        }

        redirect(team.name, channelName);
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

export function emitPopoverMentionKeyClick(isRHS, mentionKey) {
    AppDispatcher.handleViewAction({
        type: ActionTypes.POPOVER_MENTION_KEY_CLICK,
        isRHS,
        mentionKey,
    });
}

let serverVersion = '';

export function reloadIfServerVersionChanged() {
    const newServerVersion = Client4.getServerVersion();
    if (serverVersion && serverVersion !== newServerVersion) {
        console.log('Detected version update refreshing the page'); //eslint-disable-line no-console
        window.location.reload(true);
    }

    serverVersion = newServerVersion;
}
