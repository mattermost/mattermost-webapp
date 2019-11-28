// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import searchReducer from 'reducers/views/search';
import {SearchTypes} from 'utils/constants';

describe('Reducers.Search', () => {
    const initialState = {
        modalSearch: '',
        systemUsersSearch: {},
    };

    test('Initial state', () => {
        const nextState = searchReducer(
            {
                modalSearch: '',
                systemUsersSearch: {},
            },
            {}
        );

        expect(nextState).toEqual(initialState);
    });

    test(`should trim the search term for ${SearchTypes.SET_MODAL_SEARCH}`, () => {
        const nextState = searchReducer(
            {
                modalSearch: '',
            },
            {
                type: SearchTypes.SET_MODAL_SEARCH,
                data: ' something ',
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            modalSearch: 'something',
        });
    });
});
