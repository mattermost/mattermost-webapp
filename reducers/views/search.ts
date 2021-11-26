// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {GenericAction} from 'mattermost-redux/types/actions';

import {SearchTypes} from 'utils/constants';

function modalSearch(state = '', action: GenericAction) {
    switch (action.type) {
    case SearchTypes.SET_MODAL_SEARCH: {
        return action.data.trim();
    }
    default:
        return state;
    }
}

type ModalFiltersState = {roles?: string[]; channel_roles?: string[]; team_roles?: string[]};

function modalFilters(state: ModalFiltersState = {}, action: GenericAction) {
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

type SystemUserSearchState = {term: string; team: string; filter: string};

function systemUsersSearch(state: SystemUserSearchState = {term: '', team: '', filter: ''}, action: GenericAction) {
    switch (action.type) {
    case SearchTypes.SET_SYSTEM_USERS_SEARCH: {
        return action.data;
    }
    default:
        return state;
    }
}

type UserGridSearchState = {
    term: string;
    filters: {
        roles?: string[];
        channel_roles?: string[];
        team_roles?: string[];
    };
};

function userGridSearch(state: UserGridSearchState = {term: '', filters: {}}, action: GenericAction) {
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

function teamListSearch(state = '', action: GenericAction) {
    switch (action.type) {
    case SearchTypes.SET_TEAM_LIST_SEARCH: {
        return action.data.trim();
    }
    default:
        return state;
    }
}

type ChannelListSearchState = {
    term: string;
    filters: {
        public?: boolean;
        private?: boolean;
        deleted?: boolean;
        team_ids?: string[];
    };
};

function channelListSearch(state: ChannelListSearchState = {term: '', filters: {}}, action: GenericAction) {
    switch (action.type) {
    case SearchTypes.SET_CHANNEL_LIST_SEARCH: {
        const term = action.data.trim();
        return {
            ...state,
            term,
        };
    }
    case SearchTypes.SET_CHANNEL_LIST_FILTERS: {
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
    teamListSearch,
    channelListSearch,
});
