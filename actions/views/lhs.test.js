// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
    toggle,
    open,
    close,
} from 'actions/views/lhs';
import {ActionTypes} from 'utils/constants.jsx';

const mockStore = configureStore([thunk]);

describe('lhs view actions', () => {
    const initialState = {
        views: {
            lhs: {
                isOpen: false,
            },
        },
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    it('toggle dispatches the right action', () => {
        store.dispatch(toggle());

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.TOGGLE_LHS,
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });

    it('open dispatches the right action', () => {
        store.dispatch(open());

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.OPEN_LHS,
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });

    it('close dispatches the right action', () => {
        store.dispatch(close());

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.CLOSE_LHS,
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });
});
