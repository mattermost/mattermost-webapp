// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes, ModalIdentifiers} from 'utils/constants';

// plugins tracks the set of marketplace plugins returned by the server
function plugins(state = [], action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_MARKETPLACE_PLUGINS:
        return action.plugins ? action.plugins : [];

    case ActionTypes.MODAL_CLOSE:
        if (action.modalId !== ModalIdentifiers.PLUGIN_MARKETPLACE) {
            return state;
        }

        return [];

    default:
        return state;
    }
}

// installing tracks the plugins pending installation
function installing(state = {}, action) {
    switch (action.type) {
    case ActionTypes.INSTALLING_MARKETPLACE_PLUGIN:
        if (state[action.id]) {
            return state;
        }

        return {
            ...state,
            [action.id]: true,
        };

    case ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_SUCCEEDED:
    case ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_FAILED: {
        if (!Object.prototype.hasOwnProperty.call(state, action.id)) {
            return state;
        }

        const newState = {...state};
        delete newState[action.id];

        return newState;
    }

    case ActionTypes.MODAL_CLOSE:
        if (action.modalId !== ModalIdentifiers.PLUGIN_MARKETPLACE) {
            return state;
        }

        return {};

    default:
        return state;
    }
}

// errors tracks the error messages for plugins that failed installation
function errors(state = {}, action) {
    switch (action.type) {
    case ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_FAILED:
        return {
            ...state,
            [action.id]: action.error,
        };

    case ActionTypes.INSTALLING_MARKETPLACE_PLUGIN_SUCCEEDED:
    case ActionTypes.INSTALLING_MARKETPLACE_PLUGIN: {
        if (!Object.prototype.hasOwnProperty.call(state, action.id)) {
            return state;
        }

        const newState = {...state};
        delete newState[action.id];

        return newState;
    }

    case ActionTypes.MODAL_CLOSE:
        if (action.modalId !== ModalIdentifiers.PLUGIN_MARKETPLACE) {
            return state;
        }

        return {};

    default:
        return state;
    }
}

// filter tracks the current marketplace search query filter
function filter(state = '', action) {
    switch (action.type) {
    case ActionTypes.FILTER_MARKETPLACE_PLUGINS:
        return action.filter;

    case ActionTypes.MODAL_CLOSE:
        if (action.modalId !== ModalIdentifiers.PLUGIN_MARKETPLACE) {
            return state;
        }

        return '';

    default:
        return state;
    }
}

export default combineReducers({
    plugins,
    installing,
    errors,
    filter,
});
