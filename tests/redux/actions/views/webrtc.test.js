// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {updateBusyWebrtc, initWebrtc, closeWebrtc} from 'actions/views/webrtc';
import {ActionTypes} from 'utils/constants';

const mockStore = configureStore([thunk]);

describe('webrtc actions', () => {
    let store;

    beforeEach(() => {
        store = mockStore({});
    });

    test('dispatches the right action', () => {
        const expectedAction = {
            type: ActionTypes.UPDATE_BUSY_WEBRTC,
            userId: 'some-user',
        };

        store.dispatch(updateBusyWebrtc('some-user'));
        expect(store.getActions()).toEqual([expectedAction]);
    });

    test('dispatches the action with userId as null', () => {
        const expectedAction = {
            type: ActionTypes.UPDATE_BUSY_WEBRTC,
            userId: null,
        };

        store.dispatch(updateBusyWebrtc(null));
        expect(store.getActions()).toEqual([expectedAction]);
    });

    test('dispatches the inti webrtc action with userId and isCaller', () => {
        const expectedAction = {
            type: ActionTypes.INIT_WEBRTC,
            userId: 'some-user',
            isCaller: true,
        };

        store.dispatch(initWebrtc('some-user', true));
        expect(store.getActions()).toEqual([expectedAction]);
    });

    test('dispatches the close webrtc action', () => {
        const expectedAction = {
            type: ActionTypes.CLOSE_WEBRTC,
        };

        store.dispatch(closeWebrtc());
        expect(store.getActions()).toEqual([expectedAction]);
    });
});
