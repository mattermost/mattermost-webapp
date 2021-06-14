// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericAction} from 'mattermost-redux/types/actions';

import rhsStashReducer from 'reducers/views/rhs_stash';

import {RhsViewState} from 'types/store/rhs';
import {ActionTypes} from 'utils/constants';

describe('Reducers.views.rhsStash', () => {
    const rhsState = {
        filesSearchExtFilter: [],
        selectedPostId: '',
        selectedPostFocussedAt: 0,
        selectedPostCardId: '',
        selectedChannelId: '',
        highlightedPostId: '',
        previousRhsState: null,
        rhsState: null,
        searchTerms: '',
        searchType: '',
        searchResultsTerms: '',
        pluggableId: '',
        isSearchingFlaggedPost: false,
        isSearchingPinnedPost: false,
        isMenuOpen: false,
        isSidebarOpen: false,
        isSidebarExpanded: false,
    };

    test('initialState', () => {
        expect(rhsStashReducer(undefined, {} as GenericAction)).toBe(null);
    });

    test('should handle SAVE_RHS_STASH', () => {
        const data = rhsState;
        const action = {
            type: ActionTypes.SAVE_RHS_STASH,
            data,
        };

        expect(rhsStashReducer(null, action)).toEqual({
            ...rhsState,
        });
    });

    test.each([
        [{type: ActionTypes.UPDATE_RHS_STATE}],
        [{type: ActionTypes.SELECT_POST}],
        [{type: ActionTypes.SELECT_POST_CARD}],
    ])('should handle %o', (action) => {
        expect(rhsStashReducer(rhsState as RhsViewState, action)).toEqual(null);
    });

    test.each([
        [{type: ActionTypes.UPDATE_RHS_STATE, state: null}],
        [{type: ActionTypes.SELECT_POST, postId: ''}],
        [{type: ActionTypes.SELECT_POST_CARD, postId: ''}],
    ])('should handle %o', (action) => {
        expect(rhsStashReducer(rhsState as RhsViewState, action)).toEqual(rhsState);
    });
});
