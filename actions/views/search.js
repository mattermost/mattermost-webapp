// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SearchTypes} from 'utils/constants';

export function setModalSearchTerm(term) {
    return async (dispatch) => {
        dispatch({
            type: SearchTypes.SET_MODAL_SEARCH,
            data: term,
        });
        return {data: true};
    };
}

export function setSystemUsersSearch(term, team, filter = '') {
    return async (dispatch) => {
        dispatch({
            type: SearchTypes.SET_SYSTEM_USERS_SEARCH,
            data: {term, team, filter},
        });
        return {data: true};
    };
}
