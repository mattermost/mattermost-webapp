// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import remove from 'lodash/remove';

import {ActionTypes} from 'utils/constants';

function hasMenuId(menu, menuId) {
    if (!menu.subMenu) {
        return false;
    }

    if (menu.id === menuId) {
        return true;
    }
    for (const subMenu of menu.subMenu) {
        // Recursively check if subMenu contains menuId.
        if (hasMenuId(subMenu, menuId)) {
            return true;
        }
    }
    return false;
}

function buildMenu(rootMenu, data) {
    // Recursively build the full menu tree.
    const subMenu = rootMenu.subMenu.map((m) => buildMenu(m, data));
    if (rootMenu.id === data.parentMenuId) {
        subMenu.push(data);
    }

    return {
        ...rootMenu,
        subMenu,
    };
}

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
            let actionData = action.data;
            if (action.name === 'PostDropdownMenu' && actionData.parentMenuId) {
                // Remove the menu from nextArray to rebuild it later.
                const menu = remove(nextArray, (c) => hasMenuId(c, actionData.parentMenuId) && c.pluginId === actionData.pluginId);

                // Request is for an unknown menuId, return original state.
                if (!menu[0]) {
                    return state;
                }
                actionData = buildMenu(menu[0], actionData);
            }
            nextArray.push(actionData);
            nextArray.sort(sortComponents);
            nextState[action.name] = nextArray;
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

function adminConsoleReducers(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_ADMIN_CONSOLE_REDUCER: {
        if (action.data) {
            const nextState = {...state};
            nextState[action.data.pluginId] = action.data.reducer;
            return nextState;
        }
        return state;
    }
    case ActionTypes.REMOVED_ADMIN_CONSOLE_REDUCER: {
        if (action.data) {
            const nextState = {...state};
            delete nextState[action.data.pluginId];
            return nextState;
        }
        return state;
    }
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN:
    case ActionTypes.REMOVED_WEBAPP_PLUGIN:
        if (action.data) {
            const nextState = {...state};
            delete nextState[action.data.id];
            return nextState;
        }
        return state;
    default:
        return state;
    }
}

function adminConsoleCustomComponents(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_ADMIN_CONSOLE_CUSTOM_COMPONENT: {
        if (!action.data) {
            return state;
        }

        const pluginId = action.data.pluginId;
        const key = action.data.key.toLowerCase();

        const nextState = {...state};
        if (!nextState[pluginId]) {
            nextState[pluginId] = {};
        }
        const nextArray = {...nextState[pluginId]};
        nextArray[key] = action.data;
        nextState[pluginId] = nextArray;

        return nextState;
    }
    case ActionTypes.RECEIVED_WEBAPP_PLUGIN:
    case ActionTypes.REMOVED_WEBAPP_PLUGIN: {
        if (!action.data || !state[action.data.id]) {
            return state;
        }

        const pluginId = action.data.id;
        const nextState = {...state};
        delete nextState[pluginId];
        return nextState;
    }
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

    // object where every key is a plugin id and the value is a function that
    // modifies the admin console definition data structure
    adminConsoleReducers,

    // objects where every key is a plugin id and the value is an object mapping keys to a custom
    // React component to render on the plugin's system console.
    adminConsoleCustomComponents,
});
