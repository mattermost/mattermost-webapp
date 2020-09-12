// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {SearchTypes} from 'utils/constants';

function modalSearch(state = '', action) {
    switch (action.type) {
    case SearchTypes.SET_MODAL_SEARCH: {
        return action.data.trim();
    }
    default:
        return state;
    }
}

function modalFilters(state = {}, action) {
    switch (action.type) {
    case SearchTypes.SET_MODAL_FILTERS: {
        const filters = action.data;
        return {
            ...filters,
        };
    }
    default:
        return state;
    }
}

function systemUsersSearch(state = {}, action) {
    switch (action.type) {
    case SearchTypes.SET_SYSTEM_USERS_SEARCH: {
        return action.data;
    }
    default:
        return state;
    }
}

function userGridSearch(state = {}, action) {
    switch (action.type) {
    case SearchTypes.SET_USER_GRID_SEARCH: {
        const term = action.data.trim();
        return {
            ...state,
            term,
        };
    }
    case SearchTypes.SET_USER_GRID_FILTERS: {
        const filters = action.data;
        return {
            ...state,
            filters,
        };
    }
    default:
        return state;
    }
}

export default combineReducers({
    modalSearch,
    modalFilters,
    systemUsersSearch,
    userGridSearch,
});
