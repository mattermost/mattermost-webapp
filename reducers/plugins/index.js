// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes} from 'utils/constants.jsx';

function sortComponents(a, b) {
    if (a.pluginId < b.pluginId) {
        return -1;
    }

    if (a.pluginId > b.pluginId) {
        return 1;
    }

    return 0;
}

function removePostPluginComponents(state, action) {
    if (!action.data) {
        return state;
    }

    const nextState = {...state};
    let modified = false;
    Object.keys(nextState).forEach((k) => {
        const c = nextState[k];
        if (c.pluginId === action.data.id) {
            Reflect.deleteProperty(nextState, k);
            modified = true;
        }
    });

    if (modified) {
        return nextState;
    }

    return state;
}

function removePostPluginComponent(state, action) {
    const nextState = {...state};
    const keys = Object.keys(nextState);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (nextState[k].id === action.id) {
            Reflect.deleteProperty(nextState, k);
            return nextState;
        }
    }

    return state;
}

function removePluginComponents(state, action) {
    if (!action.data) {
        return state;
    }

    const nextState = {...state};
    const types = Object.keys(nextState);
    let modified = false;
    for (let i = 0; i < types.length; i++) {
        const componentType = types[i];
        const componentList = nextState[componentType] || [];
        for (let j = componentList.length - 1; j >= 0; j--) {
            if (componentList[j].pluginId === action.data.id) {
                const nextArray = [...nextState[componentType]];
                nextArray.splice(j, 1);
                nextState[componentType] = nextArray;
                modified = true;
            }
        }
    }

    if (modified) {
        return nextState;
    }

    return state;
}

function removePluginComponent(state, action) {
    const types = Object.keys(state);
    for (let i = 0; i < types.length; i++) {
        const componentType = types[i];
        const componentList = state[componentType] || [];
        for (let j = 0; j < componentList.length; j++) {
            if (componentList[j].id === action.id) {
                const nextArray = [...componentList];
                nextArray.splice(j, 1);
                return {...state, [componentType]: nextArray};
            }
        }
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
    case ActionTypes.RECEIVED_PLUGIN_COMPONENT: {
        if (action.name && action.data) {
            const nextState = {...state};
            const currentArray = nextState[action.name] || [];
            const nextArray = [...currentArray];
            nextArray.sort(sortComponents);
            nextState[action.name] = [...nextArray, action.data];
            return nextState;
        }
        return state;
    }
    case ActionTypes.REMOVED_PLUGIN_COMPONENT:
        return removePluginComponent(state, action);
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN:
    case ActionTypes.REMOVED_WEBAPP_PLUGIN:
        return removePluginComponents(state, action);
    default:
        return state;
    }
}

function postTypes(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_PLUGIN_POST_COMPONENT: {
        if (action.data) {
            // Skip saving the component if one already exists and the new plugin id
            // is lower alphabetically
            const currentPost = state[action.data.type];
            if (currentPost && action.data.pluginId > currentPost.pluginId) {
                return state;
            }

            const nextState = {...state};
            nextState[action.data.type] = action.data;
            return nextState;
        }
        return state;
    }
    case ActionTypes.REMOVED_PLUGIN_POST_COMPONENT:
        return removePostPluginComponent(state, action);
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN:
    case ActionTypes.REMOVED_WEBAPP_PLUGIN:
        return removePostPluginComponents(state, action);
    default:
        return state;
    }
}

function postCardTypes(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_PLUGIN_POST_CARD_COMPONENT: {
        if (action.data) {
            // Skip saving the component if one already exists and the new plugin id
            // is lower alphabetically
            const currentPost = state[action.data.type];
            if (currentPost && action.data.pluginId > currentPost.pluginId) {
                return state;
            }

            const nextState = {...state};
            nextState[action.data.type] = action.data;
            return nextState;
        }
        return state;
    }
    case ActionTypes.REMOVED_PLUGIN_POST_CARD_COMPONENT:
        return removePostPluginComponent(state, action);
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN:
    case ActionTypes.REMOVED_WEBAPP_PLUGIN:
        return removePostPluginComponents(state, action);
    default:
        return state;
    }
}

export default combineReducers({

    // object where every key is a plugin id and values are webapp plugin manifests
    plugins,

    // object where every key is a component name and the values are arrays of
    // components wrapped in an object that contains an id and plugin id
    components,

    // object where every key is a post type and the values are components wrapped in an
    // an object that contains a plugin id
    postTypes,

    // object where every key is a post type and the values are components wrapped in an
    // an object that contains a plugin id
    postCardTypes,
});
