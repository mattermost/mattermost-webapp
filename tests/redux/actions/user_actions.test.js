// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import * as UserActions from 'actions/user_actions';

const mockStore = configureStore([thunk]);

jest.mock('mattermost-redux/actions/users', () => {
    const original = require.requireActual('mattermost-redux/actions/users');
    return {
        ...original,
        getProfilesInTeam: (...args) => ({data: true, type: 'MOCK_GET_PROFILES_ON_TEAM', args}),
    };
});

describe('Actions.User', () => {
    const initialState = {
        entities: {
            teams: {
                currentTeamId: 'team-id',
            },
        },
    };

    test('loadProfilesAndTeamMembers', async () => {
        const expectedActions = [{
            type: 'MOCK_GET_PROFILES_ON_TEAM',
            args: ['team-id', 0, 60],
        }];

        let testStore = await mockStore({});
        await testStore.dispatch(UserActions.loadProfilesAndTeamMembers(0, 60, 'team-id', () => {}));
        let actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);

        testStore = await mockStore(initialState);
        await testStore.dispatch(UserActions.loadProfilesAndTeamMembers(0, 60));
        actualActions = testStore.getActions();
        expect(actualActions[0].args).toEqual(expectedActions[0].args);
        expect(actualActions[0].type).toEqual(expectedActions[0].type);
    });
});
