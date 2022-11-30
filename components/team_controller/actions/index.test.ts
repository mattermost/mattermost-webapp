// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelTypes} from 'mattermost-redux/action_types';
import * as channelsActions from 'mattermost-redux/actions/channels';
import * as teamsActions from 'mattermost-redux/actions/teams';
import * as teamActions from 'actions/team_actions';
import * as statusActions from 'actions/status_actions';

import mockStore from 'tests/test_store';
import {TestHelper} from 'utils/test_helper';

import {initializeTeam, joinTeam} from 'components/team_controller/actions';

describe('components/team_controller/actions', () => {
    const testUserId = 'test_user_id';
    const testUser = TestHelper.getUserMock({id: testUserId});
    const testTeamId = 'test_team_id';
    const testTeam = TestHelper.getTeamMock({id: testTeamId});
    const initialState = {
        entities: {
            users: {
                profiles: {
                    [testUserId]: testUser,
                },
                currentUserId: testUserId,
            },
            general: {
                license: {},
                config: {},
            },
        },
        requests: {
            channels: {
                getChannelsMembersCategories: {
                    status: 'not_started',
                    error: null,
                },
            },
        },
    };

    describe('initializeTeam', () => {
        test('should fire off success of getChannelsMembersCategories when fetch call passes', async () => {
            const mockActionFn: () => () => Promise<any> = () => () => Promise.resolve();
            jest.spyOn(channelsActions, 'fetchMyChannelsAndMembersREST').mockImplementation(mockActionFn);
            jest.spyOn(statusActions, 'loadStatusesForChannelAndSidebar').mockImplementation(mockActionFn);

            const testStore = await mockStore(initialState);
            await testStore.dispatch(initializeTeam(testTeam));

            expect(testStore.getActions()[1].type).toEqual(ChannelTypes.GET_CHANNELS_AND_CHANNEL_MEMBERS_SUCCESS);
        });

        test('should fire off failure of getChannelsMembersCategories when fetch call passes', async () => {
            const fetchMyChannelsAndMembersRESTFn = () => () => Promise.reject(Error('test error'));
            jest.spyOn(channelsActions, 'fetchMyChannelsAndMembersREST').mockImplementation(fetchMyChannelsAndMembersRESTFn);

            const testStore = mockStore(initialState);
            await testStore.dispatch(initializeTeam(testTeam));

            expect(testStore.getActions()[1].type).toEqual(ChannelTypes.GET_CHANNELS_AND_CHANNEL_MEMBERS_FAILURE);
        });
    });

    describe('joinTeam', () => {
        test('should not allow joining a deleted team', async () => {
            const getTeamByNameFn = () => () => Promise.resolve({data: {...testTeam, delete_at: 154545}});
            jest.spyOn(teamsActions, 'getTeamByName').mockImplementation(getTeamByNameFn);

            const testStore = mockStore(initialState);
            const result = await testStore.dispatch(joinTeam(testTeam.name, false));

            expect(result).toEqual({error: Error('Team not found or deleted')});
        });

        test('should not allow joining a team when user cannot be added to it', async () => {
            const getTeamByNameFn = () => () => Promise.resolve({data: testTeam});
            jest.spyOn(teamsActions, 'getTeamByName').mockImplementation(getTeamByNameFn);

            const addUserToTeamFn = () => () => Promise.resolve({error: {message: 'cannot add user to team'}});
            jest.spyOn(teamActions, 'addUserToTeam').mockImplementation(addUserToTeamFn);

            const testStore = mockStore(initialState);
            const result = await testStore.dispatch(joinTeam(testTeam.name, false));

            expect(result).toEqual({error: {message: 'cannot add user to team'}});
        });
    });
});
