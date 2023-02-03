// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {unfavoriteChannel} from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentChannel, getRedirectChannelNameForTeam, isFavoriteChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentRelativeTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {appsEnabled} from 'mattermost-redux/selectors/entities/apps';
import {IntegrationTypes} from 'mattermost-redux/action_types';
import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import type {CommandArgs} from '@mattermost/types/integrations';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {DoAppCallResult} from 'types/apps';

import {openModal} from 'actions/views/modals';
import * as GlobalActions from 'actions/global_actions';
import * as PostActions from 'actions/post_actions';

import {isUrlSafe, getSiteURL} from 'utils/url';
import {localizeMessage, getUserIdFromChannelName, localizeAndFormatMessage} from 'utils/utils';
import * as UserAgent from 'utils/user_agent';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {getHistory} from 'utils/browser_history';

import UserSettingsModal from 'components/user_settings/modal';
import {AppCommandParser} from 'components/suggestion/command_provider/app_command_parser/app_command_parser';
import {intlShim} from 'components/suggestion/command_provider/app_command_parser/app_command_parser_dependencies';
import LeaveChannelModal from 'components/leave_channel_modal';
import KeyboardShortcutsModal from 'components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';

import {GlobalState} from 'types/store';

import {t} from 'utils/i18n';
import MarketplaceModal from 'components/plugin_marketplace';
import WorkTemplateModal from 'components/work_templates';
import {haveICurrentTeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {isMarketplaceEnabled} from 'mattermost-redux/selectors/entities/general';
import {areWorkTemplatesEnabled} from 'selectors/work_template';

import {doAppSubmit, openAppsModal, postEphemeralCallResponseForCommandArgs} from './apps';
import {trackEvent} from './telemetry_actions';

export function executeCommand(message: string, args: CommandArgs): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;

        let msg = message;

        let cmdLength = msg.indexOf(' ');
        if (cmdLength < 0) {
            cmdLength = msg.length;
        }
        const cmd = msg.substring(0, cmdLength).toLowerCase();
        if (cmd === '/code') {
            msg = cmd + ' ' + msg.substring(cmdLength, msg.length).trimEnd();
        } else {
            msg = cmd + ' ' + msg.substring(cmdLength, msg.length).trim();
        }

        // Add track event for certain slash commands
        const commandsWithTelemetry = [
            {command: '/help', telemetry: 'slash-command-help'},
            {command: '/marketplace', telemetry: 'slash-command-marketplace'},
        ];
        for (const command of commandsWithTelemetry) {
            if (msg.startsWith(command.command)) {
                trackEvent('slash-commands', command.telemetry);
                break;
            }
        }

        switch (cmd) {
        case '/search':
            dispatch(PostActions.searchForTerm(msg.substring(cmdLength + 1, msg.length)));
            return {data: true};
        case '/shortcuts':
            if (UserAgent.isMobile()) {
                const error = {message: localizeMessage('create_post.shortcutsNotSupported', 'Keyboard shortcuts are not supported on your device')};
                return {error};
            }

            dispatch(openModal({modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL, dialogType: KeyboardShortcutsModal}));
            return {data: true};
        case '/leave': {
            // /leave command not supported in reply threads.
            if (args.channel_id && args.root_id) {
                dispatch(GlobalActions.sendEphemeralPost('/leave is not supported in reply threads. Use it in the center channel instead.', args.channel_id, args.root_id));
                return {data: true};
            }
            const channel = getCurrentChannel(state) || {};
            if (channel.type === Constants.PRIVATE_CHANNEL) {
                dispatch(openModal({modalId: ModalIdentifiers.LEAVE_PRIVATE_CHANNEL_MODAL, dialogType: LeaveChannelModal, dialogProps: {channel}}));
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
                getHistory().push(`${teamUrl}/channels/${redirectChannel}`);

                dispatch(savePreferences(currentUserId, [{category, name, user_id: currentUserId, value: 'false'}]));
                if (isFavoriteChannel(state, channel.id)) {
                    dispatch(unfavoriteChannel(channel.id));
                }

                return {data: true};
            }
            break;
        }
        case '/settings':
            dispatch(openModal({modalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal, dialogProps: {isContentProductSettings: true}}));
            return {data: true};
        case '/marketplace':
            // check if user has permissions to access the read plugins
            if (!haveICurrentTeamPermission(state, Permissions.SYSCONSOLE_READ_PLUGINS)) {
                return {error: {message: localizeMessage('marketplace_command.no_permission', 'You do not have the appropriate permissions to access the marketplace.')}};
            }

            // check config to see if marketplace is enabled
            if (!isMarketplaceEnabled(state)) {
                return {error: {message: localizeMessage('marketplace_command.disabled', 'The marketplace is disabled. Please contact your System Administrator for details.')}};
            }

            dispatch(openModal({modalId: ModalIdentifiers.PLUGIN_MARKETPLACE, dialogType: MarketplaceModal}));
            return {data: true};
        case '/templates': {
            const workTemplateEnabled = areWorkTemplatesEnabled(state);
            if (!workTemplateEnabled) {
                return {error: {message: localizeMessage('templates_command.disabled', 'Templates are disabled. Please contact your System Administrator for details.')}};
            }

            dispatch(openModal({modalId: ModalIdentifiers.WORK_TEMPLATE, dialogType: WorkTemplateModal}));
            return {data: true};
        }
        case '/collapse':
        case '/expand':
            dispatch(PostActions.resetEmbedVisibility());
            dispatch(PostActions.resetInlineImageVisibility());
        }

        if (appsEnabled(state)) {
            const getGlobalState = () => getState() as GlobalState;
            const createErrorMessage = (errMessage: string) => {
                return {error: {message: errMessage}};
            };
            const parser = new AppCommandParser({dispatch, getState: getGlobalState} as any, intlShim, args.channel_id, args.team_id, args.root_id);
            if (parser.isAppCommand(msg)) {
                try {
                    const {creq, errorMessage} = await parser.composeCommandSubmitCall(msg);
                    if (!creq) {
                        return createErrorMessage(errorMessage!);
                    }

                    const res = await dispatch(doAppSubmit(creq, intlShim)) as DoAppCallResult;

                    if (res.error) {
                        const errorResponse = res.error;
                        return createErrorMessage(errorResponse.text || intlShim.formatMessage({
                            id: 'apps.error.unknown',
                            defaultMessage: 'Unknown error.',
                        }));
                    }

                    const callResp = res.data!;
                    switch (callResp.type) {
                    case AppCallResponseTypes.OK:
                        if (callResp.text) {
                            dispatch(postEphemeralCallResponseForCommandArgs(callResp, callResp.text, args));
                        }
                        return {data: true};
                    case AppCallResponseTypes.FORM:
                        if (callResp.form) {
                            dispatch(openAppsModal(callResp.form, creq.context));
                        }
                        return {data: true};
                    case AppCallResponseTypes.NAVIGATE:
                        return {data: true};
                    default:
                        return createErrorMessage(localizeAndFormatMessage(
                            t('apps.error.responses.unknown_type'),
                            'App response type not supported. Response type: {type}.',
                            {type: callResp.type},
                        ));
                    }
                } catch (err: any) {
                    return createErrorMessage(err.message || localizeMessage('apps.error.unknown', 'Unknown error.'));
                }
            }
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
                getHistory().push(data.goto_location);
            } else if (data.goto_location.startsWith(getSiteURL())) {
                getHistory().push(data.goto_location.substr(getSiteURL().length));
            } else {
                window.open(data.goto_location);
            }
        }

        return {data: true};
    };
}
