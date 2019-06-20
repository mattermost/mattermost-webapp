// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GeneralTypes, UserTypes} from 'mattermost-redux/action_types';

import websocketReducer from 'reducers/views/websocket';

describe('Reducers.Channel', () => {
    const constantDate = new Date('2018-01-01T12:00:00');

    beforeAll(() => {
        global.Date = class extends Date {
            constructor() {
                super();
                return constantDate;
            }
        };
    });

    const initialState = {
        connected: false,
        lastConnectAt: 0,
        lastDisconnectAt: 0,
    };

    test('init state', () => {
        const nextState = websocketReducer(undefined, {});
        expect(nextState).toEqual(initialState);
    });

    test('websocket success should have connected flag true and timestamp saved', () => {
        const nextState = websocketReducer(initialState, {type: GeneralTypes.WEBSOCKET_SUCCESS});

        expect(nextState).toEqual({
            ...initialState,
            connected: true,
            lastConnectAt: 1514788200000,
        });
    });

    test('websocket success should have connected flag false and timestamp saved', () => {
        const nextState = websocketReducer({...initialState, connected: true}, {type: GeneralTypes.WEBSOCKET_FAILURE});

        expect(nextState).toEqual({
            ...initialState,
            connected: false,
            lastDisconnectAt: 1514788200000,
        });
    });

    test('reset to initstate on logout', () => {
        const nextState = websocketReducer({...initialState, connected: true}, {type: UserTypes.LOGOUT_SUCCESS});
        expect(nextState).toEqual(initialState);
    });
});
