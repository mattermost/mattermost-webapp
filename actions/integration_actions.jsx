// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import request from 'superagent';
import * as IntegrationActions from 'mattermost-redux/actions/integrations';
import {getProfilesByIds} from 'mattermost-redux/actions/users';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {ModalIdentifiers} from 'utils/constants';
import {openModal} from 'actions/views/modals';
import InteractiveDialog from 'components/interactive_dialog';
import store from 'stores/redux_store.jsx';

const DEFAULT_PAGE_SIZE = 100;

export function loadIncomingHooksAndProfilesForTeam(teamId, page = 0, perPage = DEFAULT_PAGE_SIZE) {
    return async (dispatch) => {
        const {data} = await dispatch(IntegrationActions.getIncomingHooks(teamId, page, perPage));
        if (data) {
            dispatch(loadProfilesForIncomingHooks(data));
        }
    };
}

export function loadProfilesForIncomingHooks(hooks) {
    return async (dispatch, getState) => {
        const state = getState();
        const profilesToLoad = {};
        for (let i = 0; i < hooks.length; i++) {
            const hook = hooks[i];
            if (!getUser(state, hook.user_id)) {
                profilesToLoad[hook.user_id] = true;
            }
        }

        const list = Object.keys(profilesToLoad);
        if (list.length === 0) {
            return;
        }

        dispatch(getProfilesByIds(list));
    };
}

export function loadOutgoingHooksAndProfilesForTeam(teamId, page = 0, perPage = DEFAULT_PAGE_SIZE) {
    return async (dispatch) => {
        const {data} = await dispatch(IntegrationActions.getOutgoingHooks('', teamId, page, perPage));
        if (data) {
            dispatch(loadProfilesForOutgoingHooks(data));
        }
    };
}

export function loadProfilesForOutgoingHooks(hooks) {
    return async (dispatch, getState) => {
        const state = getState();
        const profilesToLoad = {};
        for (let i = 0; i < hooks.length; i++) {
            const hook = hooks[i];
            if (!getUser(state, hook.creator_id)) {
                profilesToLoad[hook.creator_id] = true;
            }
        }

        const list = Object.keys(profilesToLoad);
        if (list.length === 0) {
            return;
        }

        dispatch(getProfilesByIds(list));
    };
}

export function loadCommandsAndProfilesForTeam(teamId) {
    return async (dispatch) => {
        const {data} = await dispatch(IntegrationActions.getCustomTeamCommands(teamId));
        if (data) {
            dispatch(loadProfilesForCommands(data));
        }
    };
}

export function loadProfilesForCommands(commands) {
    return async (dispatch, getState) => {
        const state = getState();
        const profilesToLoad = {};
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (!getUser(state, command.creator_id)) {
                profilesToLoad[command.creator_id] = true;
            }
        }

        const list = Object.keys(profilesToLoad);
        if (list.length === 0) {
            return;
        }

        dispatch(getProfilesByIds(list));
    };
}

export function loadOAuthAppsAndProfiles(page = 0, perPage = DEFAULT_PAGE_SIZE) {
    return async (dispatch) => {
        const {data} = await dispatch(IntegrationActions.getOAuthApps(page, perPage));
        if (data) {
            dispatch(loadProfilesForOAuthApps(data));
        }
    };
}

export function loadProfilesForOAuthApps(apps) {
    return async (dispatch, getState) => {
        const state = getState();
        const profilesToLoad = {};
        for (let i = 0; i < apps.length; i++) {
            const app = apps[i];
            if (!getUser(state, app.creator_id)) {
                profilesToLoad[app.creator_id] = true;
            }
        }

        const list = Object.keys(profilesToLoad);
        if (list.length === 0) {
            return;
        }

        dispatch(getProfilesByIds(list));
    };
}

export function getYoutubeVideoInfo(googleKey, videoId, success, error) {
    request.get('https://www.googleapis.com/youtube/v3/videos').
        query({part: 'snippet', id: videoId, key: googleKey}).
        end((err, res) => {
            if (err) {
                return error(err);
            }

            if (!res.body) {
                console.error('Missing response body for getYoutubeVideoInfo'); // eslint-disable-line no-console
            }

            return success(res.body);
        });
}

let previousTriggerId = '';
store.subscribe(() => {
    const state = store.getState();
    const currentTriggerId = state.entities.integrations.dialogTriggerId;

    if (currentTriggerId === previousTriggerId) {
        return;
    }

    previousTriggerId = currentTriggerId;

    const dialog = state.entities.integrations.dialog || {};
    if (dialog.trigger_id !== currentTriggerId) {
        return;
    }

    store.dispatch(openModal({modalId: ModalIdentifiers.INTERACTIVE_DIALOG, dialogType: InteractiveDialog}));
});
