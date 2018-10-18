// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as ChannelActions from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Client4} from 'mattermost-redux/client';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {browserHistory} from 'utils/browser_history';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as PostActions from 'actions/post_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded, loadProfilesForSidebar} from 'actions/user_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import {isFavoriteChannel} from 'utils/channel_utils.jsx';
import {Constants, Preferences} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import {isUrlSafe, getSiteURL} from 'utils/url.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export function executeCommand(message, args, success, error) {
    let msg = message;

    let cmdLength = msg.indexOf(' ');
    if (cmdLength < 0) {
        cmdLength = msg.length;
    }
    const cmd = msg.substring(0, cmdLength).toLowerCase();
    msg = cmd + ' ' + msg.substring(cmdLength, msg.length).trim();

    switch (cmd) {
    case '/search':
        PostActions.searchForTerm(msg.substring(cmdLength + 1, msg.length));
        return;
    case '/shortcuts':
        if (UserAgent.isMobile()) {
            const err = {message: Utils.localizeMessage('create_post.shortcutsNotSupported', 'Keyboard shortcuts are not supported on your device')};
            error(err);
            return;
        }

        GlobalActions.toggleShortcutsModal();
        return;
    case '/leave': {
        // /leave command not supported in reply threads.
        if (args.channel_id && (args.root_id || args.parent_id)) {
            GlobalActions.sendEphemeralPost('/leave is not supported in reply threads. Use it in the center channel instead.', args.channel_id, args.parent_id);
            return;
        }
        const channel = ChannelStore.getCurrent();
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            GlobalActions.showLeavePrivateChannelModal(channel);
            return;
        } else if (
            channel.type === Constants.DM_CHANNEL ||
                channel.type === Constants.GM_CHANNEL
        ) {
            let name;
            let category;
            if (channel.type === Constants.DM_CHANNEL) {
                name = Utils.getUserIdFromChannelName(channel);
                category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;
            } else {
                name = channel.id;
                category = Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW;
            }
            const currentUserId = UserStore.getCurrentId();
            dispatch(savePreferences(currentUserId, [{category, name, user_id: currentUserId, value: 'false'}]));
            if (isFavoriteChannel(channel)) {
                dispatch(ChannelActions.unfavoriteChannel(channel.id));
            }
            browserHistory.push(`${TeamStore.getCurrentTeamRelativeUrl()}/channels/${Constants.DEFAULT_CHANNEL}`);
            return;
        }
        break;
    }
    case '/settings':
        GlobalActions.showAccountSettingsModal();
        return;
    case '/collapse':
    case '/expand':
        dispatch(PostActions.resetEmbedVisibility());
    }

    Client4.executeCommand(msg, args).then(
        (data) => {
            if (success) {
                success(data);
            }

            const hasGotoLocation = data.goto_location && isUrlSafe(data.goto_location);

            if (msg.trim() === '/logout') {
                GlobalActions.emitUserLoggedOutEvent(hasGotoLocation ? data.goto_location : '/');
                return;
            }

            if (hasGotoLocation) {
                if (data.goto_location.startsWith('/')) {
                    browserHistory.push(data.goto_location);
                } else if (data.goto_location.startsWith(getSiteURL())) {
                    browserHistory.push(data.goto_location.substr(getSiteURL().length));
                } else {
                    window.open(data.goto_location);
                }
            }
        },
    ).catch(
        (err) => {
            if (error) {
                error(err);
            }
        }
    );
}

// To be removed in a future PR
export async function openDirectChannelToUser(userId, success, error) {
    const channelName = Utils.getDirectChannelName(UserStore.getCurrentId(), userId);
    const channel = ChannelStore.getByName(channelName);

    if (channel) {
        trackEvent('api', 'api_channels_join_direct');
        const now = Utils.getTimestamp();
        PreferenceStore.setPreference(Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, userId, 'true');
        PreferenceStore.setPreference(Preferences.CATEGORY_CHANNEL_OPEN_TIME, channel.id, now.toString());
        loadProfilesForSidebar();

        const currentUserId = UserStore.getCurrentId();
        savePreferences(currentUserId, [
            {user_id: currentUserId, category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: userId, value: 'true'},
            {user_id: currentUserId, category: Preferences.CATEGORY_CHANNEL_OPEN_TIME, name: channel.id, value: now.toString()},
        ])(dispatch, getState);

        if (success) {
            success(channel, true);
        }

        return;
    }

    const result = await ChannelActions.createDirectChannel(UserStore.getCurrentId(), userId)(dispatch, getState);
    loadProfilesForSidebar();
    if (result.data && success) {
        success(result.data, false);
    } else if (result.error && error) {
        error({id: result.error.server_error_id, ...result.error});
    }
}

export async function openGroupChannelToUsers(userIds, success, error) {
    const result = await ChannelActions.createGroupChannel(userIds)(dispatch, getState);
    loadProfilesForSidebar();
    if (result.data && success) {
        success(result.data, false);
    } else if (result.error && error) {
        browserHistory.push(TeamStore.getCurrentTeamUrl());
        error({id: result.error.server_error_id, ...result.error});
    }
}

export async function loadChannelsForCurrentUser() {
    await ChannelActions.fetchMyChannelsAndMembers(TeamStore.getCurrentId())(dispatch, getState);
    loadDMsAndGMsForUnreads();
}

export function loadDMsAndGMsForUnreads() {
    const unreads = ChannelStore.getUnreadCounts();
    for (const id in unreads) {
        if (!unreads.hasOwnProperty(id)) {
            continue;
        }

        if (unreads[id].msgs > 0 || unreads[id].mentions > 0) {
            const channel = ChannelStore.get(id);
            if (channel && channel.type === Constants.DM_CHANNEL) {
                loadNewDMIfNeeded(channel.id);
            } else if (channel && channel.type === Constants.GM_CHANNEL) {
                loadNewGMIfNeeded(channel.id);
            }
        }
    }
}

export async function updateChannel(channel, success, error) {
    const {data, error: err} = await ChannelActions.updateChannel(channel)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function searchMoreChannels(term, success, error) {
    const teamId = TeamStore.getCurrentId();
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.searchChannels(teamId, term)(dispatch, getState);
    if (data && success) {
        const myMembers = getMyChannelMemberships(getState());
        const channels = data.filter((c) => !myMembers[c.id]);
        success(channels);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function autocompleteChannels(term, success, error) {
    const teamId = TeamStore.getCurrentId();
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.autocompleteChannels(teamId, term)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function autocompleteChannelsForSearch(term, success, error) {
    const teamId = TeamStore.getCurrentId();
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.autocompleteChannelsForSearch(teamId, term)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function createChannel(channel, success, error) {
    const {data, error: err} = await ChannelActions.createChannel(channel)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateChannelPurpose(channelId, purpose, success, error) {
    const {data, error: err} = await ChannelActions.patchChannel(channelId, {purpose})(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateChannelHeader(channelId, header, success, error) {
    const {data, error: err} = await ChannelActions.patchChannel(channelId, {header})(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function getChannelMembersForUserIds(channelId, userIds, success, error) {
    const {data, error: err} = await ChannelActions.getChannelMembersByIds(channelId, userIds)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function deleteChannel(channelId, success, error) {
    const {data, error: err} = await ChannelActions.deleteChannel(channelId)(dispatch, getState);

    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function addUsersToChannel(channelId, userIds) {
    return async (doDispatch) => {
        try {
            const requests = userIds.map((uId) => doDispatch(ChannelActions.addChannelMember(channelId, uId)));

            return await Promise.all(requests);
        } catch (error) {
            return {error};
        }
    };
}
