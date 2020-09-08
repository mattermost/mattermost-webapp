// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SearchTypes} from 'utils/constants';

export function setModalSearchTerm(term) {
    return {
        type: SearchTypes.SET_MODAL_SEARCH,
        data: term,
    };
}

export function setModalFilters(filters = {}) {
    return {
        type: SearchTypes.SET_MODAL_FILTERS,
        data: filters,
    };
}

export function setUserGridSearch(term) {
    return {
        type: SearchTypes.SET_USER_GRID_SEARCH,
        data: term,
    };
}

export function setUserGridFilters(filters = {}) {
    return {
        type: SearchTypes.SET_USER_GRID_FILTERS,
        data: filters,
    };
}

export function setSystemUsersSearch(term, team = '', filter = '') {
    return {
        type: SearchTypes.SET_SYSTEM_USERS_SEARCH,
        data: {term, team, filter},
    };
}
