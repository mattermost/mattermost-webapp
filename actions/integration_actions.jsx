// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import request from 'superagent';
import * as IntegrationActions from 'mattermost-redux/actions/integrations';
import {getProfilesByIds, getUser} from 'mattermost-redux/actions/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import store from 'stores/redux_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function loadIncomingHooks(complete) {
    const {data} = await IntegrationActions.getIncomingHooks('', 0, 10000)(dispatch, getState);
    if (data) {
        loadProfilesForIncomingHooks(data);
    }

    if (complete) {
        complete(data);
    }
}

export async function loadIncomingHooksForTeam(teamId, complete) {
    const {data} = await IntegrationActions.getIncomingHooks(teamId, 0, 10000)(dispatch, getState);
    if (data) {
        loadProfilesForIncomingHooks(data);
    }

    if (complete) {
        complete(data);
    }
}

function loadProfilesForIncomingHooks(hooks) {
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

    getProfilesByIds(list)(dispatch, getState);
}

export async function loadOutgoingHooks(complete) {
    const {data} = await IntegrationActions.getOutgoingHooks('', '', 0, 10000)(dispatch, getState);
    if (data) {
        loadProfilesForOutgoingHooks(data);
    }

    if (complete) {
        complete(data);
    }
}

export async function loadOutgoingHooksForTeam(teamId, complete) {
    const {data} = await IntegrationActions.getOutgoingHooks('', teamId, 0, 10000)(dispatch, getState);
    if (data) {
        loadProfilesForOutgoingHooks(data);
    }

    if (complete) {
        complete(data);
    }
}

function loadProfilesForOutgoingHooks(hooks) {
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

    getProfilesByIds(list)(dispatch, getState);
}

export async function loadTeamCommands(complete) {
    const {data} = await dispatch(IntegrationActions.getCustomTeamCommands(getCurrentTeamId(getState())));
    if (data) {
        loadProfilesForCommands(data);
    }

    if (complete) {
        complete(data);
    }
}

function loadProfilesForCommands(commands) {
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

    getProfilesByIds(list)(dispatch, getState);
}

export async function addIncomingHook(hook, success, error) {
    const {data, error: err} = await IntegrationActions.createIncomingHook(hook)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateIncomingHook(hook, success, error) {
    const {data, error: err} = await IntegrationActions.updateIncomingHook(hook)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function addOutgoingHook(hook, success, error) {
    const {data, error: err} = await IntegrationActions.createOutgoingHook(hook)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateOutgoingHook(hook, success, error) {
    const {data, error: err} = await IntegrationActions.updateOutgoingHook(hook)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function deleteIncomingHook(id) {
    IntegrationActions.removeIncomingHook(id)(dispatch, getState);
}

export function deleteOutgoingHook(id) {
    IntegrationActions.removeOutgoingHook(id)(dispatch, getState);
}

export function regenOutgoingHookToken(id) {
    IntegrationActions.regenOutgoingHookToken(id)(dispatch, getState);
}

export async function addCommand(command, success, error) {
    const {data, error: err} = await IntegrationActions.addCommand(command)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function editCommand(command, success, error) {
    const {data, error: err} = await IntegrationActions.editCommand(command)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function deleteCommand(id) {
    IntegrationActions.deleteCommand(id)(dispatch, getState);
}

export function regenCommandToken(id) {
    IntegrationActions.regenCommandToken(id)(dispatch, getState);
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
