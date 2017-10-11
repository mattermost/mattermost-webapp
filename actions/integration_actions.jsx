// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import request from 'superagent';

import * as IntegrationActions from 'mattermost-redux/actions/integrations';
import {getProfilesByIds} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import {ActionTypes} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

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
    const profilesToLoad = {};
    for (let i = 0; i < hooks.length; i++) {
        const hook = hooks[i];
        if (!UserStore.hasProfile(hook.user_id)) {
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
    const profilesToLoad = {};
    for (let i = 0; i < hooks.length; i++) {
        const hook = hooks[i];
        if (!UserStore.hasProfile(hook.creator_id)) {
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
    const {data} = await IntegrationActions.getCustomTeamCommands(TeamStore.getCurrentId())(dispatch, getState);
    if (data) {
        loadProfilesForCommands(data);
    }

    if (complete) {
        complete(data);
    }
}

function loadProfilesForCommands(commands) {
    const profilesToLoad = {};
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (!UserStore.hasProfile(command.creator_id)) {
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

export function getSuggestedCommands(command, suggestionId, component) {
    Client4.getCommandsList(TeamStore.getCurrentId()).then(
        (data) => {
            let matches = [];
            data.forEach((cmd) => {
                if (!cmd.auto_complete) {
                    return;
                }

                if (cmd.trigger !== 'shortcuts' || !UserAgent.isMobile()) {
                    if (('/' + cmd.trigger).indexOf(command) === 0) {
                        const s = '/' + cmd.trigger;
                        let hint = '';
                        if (cmd.auto_complete_hint && cmd.auto_complete_hint.length !== 0) {
                            hint = cmd.auto_complete_hint;
                        }
                        matches.push({
                            suggestion: s,
                            hint,
                            description: cmd.auto_complete_desc
                        });
                    }
                }
            });

            matches = matches.sort((a, b) => a.suggestion.localeCompare(b.suggestion));

            // pull out the suggested commands from the returned data
            const terms = matches.map((suggestion) => suggestion.suggestion);

            if (terms.length > 0) {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: command,
                    terms,
                    items: matches,
                    component
                });
            }
        }
    ).catch(
        () => {} //eslint-disable-line no-empty-function
    );
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
