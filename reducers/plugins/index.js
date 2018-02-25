// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes} from 'utils/constants.jsx';

function removePluginComponents(state, action) {
    if (!action.data) {
        return state;
    }

    const nextState = {...state};
    let modified = false;
    Object.keys(nextState).forEach((k) => {
        const c = nextState[k];
        if (c.id === action.data.id) {
            Reflect.deleteProperty(nextState, k);
            modified = true;
        }
    });

    if (modified) {
        return nextState;
    }

    return state;
}

function plugins(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_WEBAPP_PLUGINS: {
        if (action.data) {
            const nextState = {};
            action.data.forEach((p) => {
                nextState[p.id] = p;
            });
            return nextState;
        }
        return state;
    }
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN: {
        if (action.data) {
            const nextState = {...state};
            nextState[action.data.id] = action.data;
            return nextState;
        }
        return state;
    }
    case ActionTypes.REMOVED_WEBAPP_PLUGIN: {
        if (action.data && state[action.data.id]) {
            const nextState = {...state};
            Reflect.deleteProperty(nextState, action.data.id);
            return nextState;
        }
        return state;
    }

    default:
        return state;
    }
}

function components(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_PLUGIN_COMPONENTS: {
        if (action.data) {
            return {...action.data, ...state};
        }
        return state;
    }
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN:
    case ActionTypes.REMOVED_WEBAPP_PLUGIN:
        return removePluginComponents(state, action);
    default:
        return state;
    }
}

function postTypes(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_PLUGIN_POST_TYPES: {
        if (action.data) {
            return {...action.data, ...state};
        }
        return state;
    }
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN:
    case ActionTypes.REMOVED_WEBAPP_PLUGIN:
        return removePluginComponents(state, action);
    default:
        return state;
    }
}

export default combineReducers({

    // object where every key is a plugin id and values are webapp plugin manifests
    plugins,

    // object where every key is a component name and the values are components wrapped
    // in an object that contains a plugin id
    components,

    // object where every key is a post type and the values are components wrapped in an
    // an object that contains a plugin id
    postTypes,
});
