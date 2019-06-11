// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import * as channels from 'mattermost-redux/actions/channels';

import {getState} from 'stores/redux_store';

import GenericTeamChannelProvider from 'components/suggestion/generic_team_channel_provider.jsx';

jest.mock('stores/redux_store', () => ({
    dispatch: jest.fn(),
    getState: jest.fn(),
}));

jest.mock('mattermost-redux/actions/channels');

describe('components/GenericTeamChannelProvider', () => {
    const defaultState = {
        entities: {
            users: {
                currentUserId: 'someUserId',
            },
        },
    };

    it('should show just channels in team when team id is specified', async () => {
        const mockStore = configureStore();
        const resultsCallback = jest.fn();

        const state = {
            ...defaultState,
        };

        const store = mockStore(state);
        const channelProvider = new GenericTeamChannelProvider('someTeamId');

        const result = [{
            id: 'someChannelInTeam',
            type: 'O',
            name: 'some-channel-in-team',
            display_name: 'Some Channel in Team',
            delete_at: 0,
        }];

        getState.mockImplementation(store.getState);
        channels.autocompleteChannels.mockImplementation(() => () => ({data: result}));

        const searchText = 'some';
        await channelProvider.handlePretextChanged(searchText, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items[0].id).toEqual('someChannelInTeam');
        expect(args.items.length).toEqual(1);
    });

    it('should show no channels when no channels are returned', async () => {
        const mockStore = configureStore();
        const resultsCallback = jest.fn();

        const state = {
            ...defaultState,
        };

        const store = mockStore(state);
        const channelProvider = new GenericTeamChannelProvider('someOtherTeamId');

        const result = [];

        getState.mockImplementation(store.getState);
        channels.autocompleteChannels.mockImplementation(() => () => ({data: result}));

        const searchText = 'some';
        await channelProvider.handlePretextChanged(searchText, resultsCallback);
        expect(resultsCallback).toHaveBeenCalled();
        const args = resultsCallback.mock.calls[0][0];
        expect(args.items.length).toEqual(0);
    });
});
