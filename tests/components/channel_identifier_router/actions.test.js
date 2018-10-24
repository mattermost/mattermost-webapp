// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {emitChannelClickEvent} from 'actions/global_actions.jsx';
import {goToChannelByChannelName} from 'components/channel_layout/channel_identifier_router/actions';

jest.mock('actions/global_actions.jsx', () => ({
    emitChannelClickEvent: jest.fn(),
}));

const mockStore = configureStore([thunk]);

describe('Actions', () => {
    const channel1 = {id: 'channel_id1', name: 'achannel', team_id: 'team_id1'};
    const channel2 = {id: 'channel_id2', name: 'achannel', team_id: 'team_id2'};

    const initialState = {
        entities: {
            channels: {
                currentChannelId: 'channel_id1',
                channels: {channel_id1: channel1, channel_id2: channel2},
                myMembers: {channel_id1: {channel_id: 'channel_id1', user_id: 'current_user_id'}, channel_id2: {channel_id: 'channel_id2', user_id: 'current_user_id'}},
                channelsInTeam: {team_id1: ['channel_id1'], team_id2: ['channel_id2']},
            },
            teams: {
                currentTeamId: 'team_id1',
                teams: {
                    team_id1: {
                        id: 'team_id1',
                        name: 'team1',
                    },
                    team_id2: {
                        id: 'team_id2',
                        name: 'team2',
                    },
                },
            },
            users: {
                currentUserId: 'current_user_id',
            },
            general: {license: {IsLicensed: 'false'}},
        },
    };

    describe('goToChannelByChannelName', () => {
        test('switch to channel on different team with same name', async () => {
            const testStore = await mockStore(initialState);

            await testStore.dispatch(goToChannelByChannelName({params: {team: 'team2', identifier: 'achannel'}}, {}));
            expect(emitChannelClickEvent).toHaveBeenCalledWith(channel2);
        });
    });
});
