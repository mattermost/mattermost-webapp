// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import webrtcReducer from 'reducers/views/webrtc';
import {ActionTypes} from 'utils/constants.jsx';

describe('Reducers.Webrtc', () => {
    const initialState = {isBusy: false, isOpen: false};

    describe('isBusy', () => {
        test('return initial state', () => {
            const nextState = webrtcReducer(initialState, {});
            expect(nextState).toEqual(initialState);
        });

        test('set busy to true in case the user is not null and action is UPDATE_BUSY_WEBRTC', () => {
            const action = {
                type: ActionTypes.UPDATE_BUSY_WEBRTC,
                userId: 'someUserId',
            };

            const nextState = webrtcReducer({}, action);
            expect(nextState).toEqual({...initialState, isBusy: true});
        });

        test('set busy to false in case the user is null and action is UPDATE_BUSY_WEBRTC', () => {
            const action = {
                type: ActionTypes.UPDATE_BUSY_WEBRTC,
                userId: null,
            };

            const nextState = webrtcReducer({}, action);
            expect(nextState).toEqual({...initialState, isBusy: false});
        });
    });
});
