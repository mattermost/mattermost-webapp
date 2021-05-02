// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {OutgoingWebhook, Command} from 'mattermost-redux/types/integrations';
import {GlobalState} from 'mattermost-redux/types/store';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

import {appsEnabled} from './apps';

export function getIncomingHooks(state: GlobalState) {
    return state.entities.integrations.incomingHooks;
}

export function getOutgoingHooks(state: GlobalState) {
    return state.entities.integrations.outgoingHooks;
}

export function getCommands(state: GlobalState) {
    return state.entities.integrations.commands;
}

export function getOAuthApps(state: GlobalState) {
    return state.entities.integrations.oauthApps;
}

export const getAppsOAuthAppIDs: (state: GlobalState) => string[] = createSelector(
    appsEnabled,
    (state: GlobalState) => state.entities.integrations.appsOAuthAppIDs,
    (apps, ids) => {
        return apps ? ids : [];
    },
);

export const getAppsBotIDs: (state: GlobalState) => string[] = createSelector(
    appsEnabled,
    (state: GlobalState) => state.entities.integrations.appsBotIDs,
    (apps, ids) => {
        return apps ? ids : [];
    },
);

export function getSystemCommands(state: GlobalState) {
    return state.entities.integrations.systemCommands;
}

/**
 * get outgoing hooks in current team
 */
export const getOutgoingHooksInCurrentTeam: (state: GlobalState) => OutgoingWebhook[] = createSelector(
    getCurrentTeamId,
    getOutgoingHooks,
    (teamId, hooks) => {
        return Object.values(hooks).filter((o) => o.team_id === teamId);
    },
);

export const getAllCommands: (state: GlobalState) => IDMappedObjects<Command> = createSelector(
    getCommands,
    getSystemCommands,
    (commands, systemCommands) => {
        return {
            ...commands,
            ...systemCommands,
        };
    },
);

export const getAutocompleteCommandsList: (state: GlobalState) => Command[] = createSelector(
    getAllCommands,
    getCurrentTeamId,
    (commands, currentTeamId) => {
        return Object.values(commands).filter((command) => {
            return command && (!command.team_id || command.team_id === currentTeamId) && command.auto_complete;
        }).sort((a, b) => a.display_name.localeCompare(b.display_name));
    },
);
