// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {
    updateRhsState
} from 'actions/views/rhs';

import {ActionTypes, RHSStates} from 'utils/constants.jsx';

const mockStore = configureStore([thunk]);

const currentChannelId = '123';

describe('rhs view actions', () => {
    const initialState = {
        entities: {
            channels: {
                currentChannelId
            }
        }
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    describe('updateRhsState', () => {
        test(`it dispatches ${ActionTypes.UPDATE_RHS_STATE} correctly`, () => {
            store.dispatch(updateRhsState(RHSStates.PIN));

            const action = {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.PIN,
                channelId: getCurrentChannelId(store.getState())
            };

            expect(store.getActions()).toEqual([action]);
        });
    });
});