// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
    addHiddenDefaultChannel,
    removeHiddenDefaultChannel,
} from 'actions/views/channel';
import {ActionTypes} from 'utils/constants.jsx';

const mockStore = configureStore([thunk]);

describe('channels view actions', () => {
    const initialState = {
        views: {
            channel: {
                team_id: 'channel_id',
            },
        },
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    it('addHiddenDefaultChannel dispatches the right action and data', () => {
        store.dispatch(addHiddenDefaultChannel('team_id_1', 'channel_id_1'));

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.ADD_HIDDEN_DEFAULT_CHANNEL,
            data: {teamId: 'team_id_1', channelId: 'channel_id_1'},
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });

    it('removeHiddenDefaultChannel dispatches the right action and data', () => {
        store.dispatch(removeHiddenDefaultChannel('team_id', 'channel_id'));

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.REMOVE_HIDDEN_DEFAULT_CHANNEL,
            data: {teamId: 'team_id', channelId: 'channel_id'},
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });
});
