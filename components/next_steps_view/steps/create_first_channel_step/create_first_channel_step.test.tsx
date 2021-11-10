// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import CreateFirstChannelStep from './create_first_channel_step';

let mockState: any;
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));
describe('components/next_steps_view/steps/create_channel_step', () => {
    beforeEach(() => {
        // required state to mount using the provider
        mockState = {
            entities: {
                admin: {
                    analytics: {
                        TOTAL_USERS: 9,
                    },
                    prevTrialLicense: {
                        IsLicensed: 'false',
                    },
                },
                preferences: {
                    myPreferences: {
                        'start_trial_modal--trial_modal_auto_shown': {
                            name: 'trial_modal_auto_shown',
                            value: 'false',
                        },
                    },
                },
                general: {
                    config: {
                    },
                    license: {
                        IsLicensed: 'false',
                    },
                },
                teams: {
                    currentTeamId: 'team-id',
                    myMembers: {
                        'team-id': {
                            team_id: 'team-id',
                            user_id: 'test-user-id',
                            roles: 'team_user',
                            scheme_user: 'true',
                        },
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_user'},
                    },
                },
                roles: {
                    roles: {
                        system_role: {permissions: ['test_system_permission', 'add_user_to_team', 'invite_guest']},
                        team_role: {permissions: ['test_team_no_permission']},
                    },
                },
            },
            views: {
            },
        };
    });
    const props = {
        id: 'test',
        currentUser: TestHelper.getUserMock(),
        expanded: true,
        isAdmin: false,
        isLastStep: false,
        onSkip: () => {},
        onFinish: () => {},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<CreateFirstChannelStep {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
