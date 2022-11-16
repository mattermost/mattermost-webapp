// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type {
    AppCall,
    AppCallRequest,
    AppCallValues,
    AppBinding,
    AppField,
    AppContext,
    AppForm,
    AutocompleteElement,
    AutocompleteDynamicSelect,
    AutocompleteStaticSelect,
    AutocompleteUserSelect,
    AutocompleteChannelSelect,
    AppLookupResponse,
    AppSelectOption,
} from '@mattermost/types/apps';

export type {
    DoAppCallResult,
} from 'types/apps';

import type {
    AutocompleteSuggestion,
} from '@mattermost/types/integrations';
export type {AutocompleteSuggestion};

import type {
    Channel,
} from '@mattermost/types/channels';
export type {Channel};

import {
    GlobalState,
} from 'types/store';

import type {
    DispatchFunc,
} from 'mattermost-redux/types/actions';

export type {
    UserAutocomplete,
} from '@mattermost/types/autocomplete';

import type {
    UserProfile,
} from '@mattermost/types/users';
export type {UserProfile};

export {
    AppBindingLocations,
    AppFieldTypes,
    AppCallResponseTypes,
} from 'mattermost-redux/constants/apps';

export {autocompleteUsersInChannel} from 'actions/views/channel';

export {makeAppBindingsSelector, makeRHSAppBindingSelector, getAppCommandForm, getAppRHSCommandForm} from 'mattermost-redux/selectors/entities/apps';

export {getPost} from 'mattermost-redux/selectors/entities/posts';
export {getChannel as selectChannel, getCurrentChannel, getChannelByName as selectChannelByName} from 'mattermost-redux/selectors/entities/channels';
export {getCurrentTeamId, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
export {getUserByUsername as selectUserByUsername, getUser as selectUser} from 'mattermost-redux/selectors/entities/users';

export {getUserByUsername, getUser} from 'mattermost-redux/actions/users';
export {getChannelByNameAndTeamName, getChannel, autocompleteChannels} from 'mattermost-redux/actions/channels';

export {doAppFetchForm, doAppLookup} from 'actions/apps';
import {sendEphemeralPost} from 'actions/global_actions';

export {
    createCallRequest,
    filterEmptyOptions,
} from 'utils/apps';

import {
    isMac,
    localizeAndFormatMessage,
} from 'utils/utils';

export type Store = {
    dispatch: DispatchFunc;
    getState: () => GlobalState;
}

import ReduxStore from 'stores/redux_store';
export const getStore = () => ReduxStore;

export {getChannelSuggestions, getUserSuggestions, inTextMentionSuggestions} from '../mentions';

import {Constants} from 'utils/constants';
export const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;
export const OPEN_COMMAND_IN_MODAL_ITEM_ID = Constants.Integrations.OPEN_COMMAND_IN_MODAL_ITEM_ID;
export const COMMAND_SUGGESTION_ERROR = Constants.Integrations.COMMAND_SUGGESTION_ERROR;
export const COMMAND_SUGGESTION_CHANNEL = Constants.Integrations.COMMAND_SUGGESTION_CHANNEL;
export const COMMAND_SUGGESTION_USER = Constants.Integrations.COMMAND_SUGGESTION_USER;

import type {ParsedCommand} from './app_command_parser';
export {AppsTypes} from 'mattermost-redux/action_types';

export const getExecuteSuggestion = (parsed: ParsedCommand): AutocompleteSuggestion | null => {
    let key = 'Ctrl';
    if (isMac()) {
        key = '⌘';
    }

    return {
        Complete: parsed.command.substring(1) + EXECUTE_CURRENT_COMMAND_ITEM_ID,
        Suggestion: 'Execute Current Command',
        Hint: '',
        Description: 'Select this option or use ' + key + '+Enter to execute the current command.',
        IconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
    };
};

export const getOpenInModalSuggestion = (parsed: ParsedCommand): AutocompleteSuggestion | null => {
    return {
        Complete: parsed.command.substring(1) + OPEN_COMMAND_IN_MODAL_ITEM_ID,
        Suggestion: 'Open in modal',
        Hint: '',
        Description: 'Select this option to open the current command in a modal.',
        IconData: OPEN_COMMAND_IN_MODAL_ITEM_ID,
    };
};

export type ExtendedAutocompleteSuggestion = AutocompleteSuggestion & {
    item?: UserProfile | Channel;
}

export const displayError = (err: string, channelID: string, rootID?: string) => {
    ReduxStore.dispatch(sendEphemeralPost(err, channelID, rootID));
};

// Shim of mobile-version intl
export const intlShim = {
    formatMessage: (config: {id: string; defaultMessage: string}, values?: {[name: string]: any}) => {
        return localizeAndFormatMessage(config.id, config.defaultMessage, values);
    },
};

export const errorMessage = (intl: typeof intlShim, error: string, _command: string, _position: number): string => { // eslint-disable-line @typescript-eslint/no-unused-vars
    return intl.formatMessage({
        id: 'apps.error.parser',
        defaultMessage: 'Parsing error: {error}',
    }, {
        error,
    });
};
