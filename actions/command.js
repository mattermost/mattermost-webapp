// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {unfavoriteChannel} from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentChannel, getRedirectChannelNameForTeam, isFavoriteChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentRelativeTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {IntegrationTypes} from 'mattermost-redux/action_types';

import {openModal} from 'actions/views/modals';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as PostActions from 'actions/post_actions.jsx';

import {isUrlSafe, getSiteURL} from 'utils/url';
import {localizeMessage, getUserIdFromChannelName} from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';

import UserSettingsModal from 'components/user_settings/modal';

export function executeCommand(message, args) {
    return async (dispatch, getState) => {
        const state = getState();

        let msg = message;

        let cmdLength = msg.indexOf(' ');
        if (cmdLength < 0) {
            cmdLength = msg.length;
        }
        const cmd = msg.substring(0, cmdLength).toLowerCase();
        msg = cmd + ' ' + msg.substring(cmdLength, msg.length).trim();

        switch (cmd) {
        case '/search':
            dispatch(PostActions.searchForTerm(msg.substring(cmdLength + 1, msg.length)));
            return {data: true};
        case '/shortcuts':
            if (UserAgent.isMobile()) {
                const error = {message: localizeMessage('create_post.shortcutsNotSupported', 'Keyboard shortcuts are not supported on your device')};
                return {error};
            }

            GlobalActions.toggleShortcutsModal();
            return {data: true};
        case '/leave': {
        // /leave command not supported in reply threads.
            if (args.channel_id && (args.root_id || args.parent_id)) {
                GlobalActions.sendEphemeralPost('/leave is not supported in reply threads. Use it in the center channel instead.', args.channel_id, args.parent_id);
                return {data: true};
            }
            const channel = getCurrentChannel(state) || {};
            if (channel.type === Constants.PRIVATE_CHANNEL) {
                GlobalActions.showLeavePrivateChannelModal(channel);
                return {data: true};
            }
            if (
                channel.type === Constants.DM_CHANNEL ||
                channel.type === Constants.GM_CHANNEL
            ) {
                const currentUserId = getCurrentUserId(state);
                let name;
                let category;
                if (channel.type === Constants.DM_CHANNEL) {
                    name = getUserIdFromChannelName(channel);
                    category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;
                } else {
                    name = channel.id;
                    category = Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW;
                }
                const currentTeamId = getCurrentTeamId(state);
                const redirectChannel = getRedirectChannelNameForTeam(state, currentTeamId);
                const teamUrl = getCurrentRelativeTeamUrl(state);
                browserHistory.push(`${teamUrl}/channels/${redirectChannel}`);

                dispatch(savePreferences(currentUserId, [{category, name, user_id: currentUserId, value: 'false'}]));
                if (isFavoriteChannel(state, channel.id)) {
                    dispatch(unfavoriteChannel(channel.id));
                }

                return {data: true};
            }
            break;
        }
        case '/settings':
            dispatch(openModal({modalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal}));
            return {data: true};
        case '/collapse':
        case '/expand':
            dispatch(PostActions.resetEmbedVisibility());
        }

        let data;
        try {
            data = await Client4.executeCommand(msg, args);
        } catch (err) {
            return {error: err};
        }

        const hasGotoLocation = data.goto_location && isUrlSafe(data.goto_location);

        if (msg.trim() === '/logout') {
            GlobalActions.emitUserLoggedOutEvent(hasGotoLocation ? data.goto_location : '/');
            return {data: true};
        }

        if (data.trigger_id) {
            dispatch({type: IntegrationTypes.RECEIVED_DIALOG_TRIGGER_ID, data: data.trigger_id});
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

        return {data: true};
    };
}
