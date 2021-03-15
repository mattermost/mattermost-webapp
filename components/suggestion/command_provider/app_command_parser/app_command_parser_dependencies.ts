// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type {
    AppCallRequest,
    AppCallValues,
    AppBinding,
    AppField,
    AppSelectOption,
    AppCallResponse,
    AppContext,
    AppForm,
    AutocompleteElement,
    AutocompleteDynamicSelect,
    AutocompleteStaticSelect,
    AutocompleteUserSelect,
    AutocompleteChannelSelect,
} from 'mattermost-redux/types/apps';

import type {
    AutocompleteSuggestion,
} from 'mattermost-redux/types/integrations';
export type {AutocompleteSuggestion};

export type {
    Channel,
} from 'mattermost-redux/types/channels';

export {
    GlobalState,
} from 'types/store';

export type {
    DispatchFunc,
} from 'mattermost-redux/types/actions';

export {
    AppBindingLocations,
    AppCallTypes,
    AppFieldTypes,
    AppCallResponseTypes,
} from 'mattermost-redux/constants/apps';

import {getAppBindings as getAppsBindings} from 'mattermost-redux/selectors/entities/apps';
export {getAppsBindings};

export {getPost} from 'mattermost-redux/selectors/entities/posts';
export {getChannel, getCurrentChannel, getChannelByName as selectChannelByName} from 'mattermost-redux/selectors/entities/channels';
export {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
export {getUserByUsername as selectUserByUsername} from 'mattermost-redux/selectors/entities/users';
export {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

export {getUserByUsername} from 'mattermost-redux/actions/users';
export {getChannelByNameAndTeamName} from 'mattermost-redux/actions/channels';

export {doAppCall} from 'actions/apps';
export {createCallRequest} from 'utils/apps';

import keyMirror from 'mattermost-redux/utils/key_mirror';
export {keyMirror};

import Store from 'stores/redux_store';
export const getStore = () => Store;

export const EXECUTE_CURRENT_COMMAND_ITEM_ID = '_execute_current_command';

import {isMac} from 'utils/utils.jsx';

import type {ParsedCommand} from './app_command_parser';

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

import {sendEphemeralPost} from 'actions/global_actions';
import {intlShape} from 'utils/react_intl';
export const displayError = (err: string) => {
    sendEphemeralPost(err);
};
