// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mount, shallow} from 'enzyme';

import ShowStartTrialModal from 'components/announcement_bar/show_start_trial_modal/show_start_trial_modal';

const mockDispatch = jest.fn();
let mockState: any;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/sidebar/show_start_trial_modal', () => {
    beforeEach(() => {
        const now = new Date().getTime();

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
                        InstallationDate: now,
                    },
                    license: {
                        IsLicensed: 'false',
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
        };
    });

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ShowStartTrialModal/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('should return nothing when user is not an admin', () => {
        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });

    test('should NOT dispatch the modal when there are less than 10 users', () => {
        const isAdminUser = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_admin system_user'},
            },
        };

        const moreThan6Hours = {
            config: {

                // installation date is set to be 10 hours before current time
                InstallationDate: new Date().getTime() - ((10 * 60 * 60) * 1000),
            },
        };

        mockState = {...mockState, entities: {...mockState.entities, users: isAdminUser, general: moreThan6Hours}};

        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });

    test('should NOT dispatch the modal when the env has less than 6 hours of creation', () => {
        const isAdminUser = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_admin system_user'},
            },
        };

        const moreThan10Users = {
            analytics: {
                TOTAL_USERS: 11,
            },
        };

        const moreThan6Hours = {
            config: {

                // installation date is set to be 5 hours before current time
                InstallationDate: new Date().getTime() - ((5 * 60 * 60) * 1000),
            },
        };

        mockState = {...mockState, entities: {...mockState.entities, users: isAdminUser, admin: moreThan10Users, general: moreThan6Hours}};

        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });

    test('should NOT dispatch the modal when the env has previous license', () => {
        const isAdminUser = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_admin system_user'},
            },
        };

        const moreThan10UsersAndPrevLicensed = {
            analytics: {
                TOTAL_USERS: 11,
            },
            prevTrialLicense: {
                IsLicensed: 'true',
            },
        };

        mockState = {...mockState, entities: {...mockState.entities, users: isAdminUser, admin: moreThan10UsersAndPrevLicensed}};

        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });

    test('should NOT dispatch the modal when the env is currently licensed', () => {
        const isAdminUser = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_admin system_user'},
            },
        };

        const moreThan10UsersAndLicensed = {
            analytics: {
                TOTAL_USERS: 11,
            },
        };

        const moreThan6HoursAndLicensed = {
            config: {

                // installation date is set to be 10 hours before current time
                InstallationDate: new Date().getTime() - ((10 * 60 * 60) * 1000),
            },
            license: {
                IsLicensed: 'true',
            },
        };

        mockState = {...mockState, entities: {...mockState.entities, users: isAdminUser, admin: moreThan10UsersAndLicensed, general: moreThan6HoursAndLicensed}};

        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });

    test('should NOT dispatch the modal when the modal has been already dismissed', () => {
        const isAdminUser = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_admin system_user'},
            },
        };

        const moreThan10Users = {
            analytics: {
                TOTAL_USERS: 11,
            },
        };

        const moreThan6Hours = {
            config: {

                // installation date is set to be 10 hours before current time
                InstallationDate: new Date().getTime() - ((10 * 60 * 60) * 1000),
            },
        };

        const modalDismissed = {
            myPreferences: {
                'start_trial_modal--trial_modal_auto_shown': {
                    name: 'trial_modal_auto_shown',
                    value: 'true',
                },
            },
        };

        mockState = {
            ...mockState,
            entities: {
                ...mockState.entities,
                users: isAdminUser,
                admin: moreThan10Users,
                general: moreThan6Hours,
                preferences: modalDismissed,
            },
        };

        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });

    test('should NOT dispatch the modal when user is not an admin', () => {
        const isAdminUser = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_user'},
            },
        };

        const moreThan10Users = {
            analytics: {
                TOTAL_USERS: 11,
            },
            prevTrialLicense: {
                IsLicensed: 'false',
            },
        };

        const moreThan6Hours = {
            config: {

                // installation date is set to be 10 hours before current time
                InstallationDate: new Date().getTime() - ((10 * 60 * 60) * 1000),
            },
            license: {
                IsLicensed: 'false',
            },
        };

        mockState = {...mockState, entities: {...mockState.entities, users: isAdminUser, admin: moreThan10Users, general: moreThan6Hours}};

        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });
    test('should dispatch the modal when there are more than 10 users', () => {
        const isAdminUser = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_admin system_user'},
            },
        };

        const moreThan10Users = {
            analytics: {
                TOTAL_USERS: 11,
            },
            prevTrialLicense: {
                IsLicensed: 'false',
            },
        };

        const moreThan6Hours = {
            config: {

                // installation date is set to be 10 hours before current time
                InstallationDate: new Date().getTime() - ((10 * 60 * 60) * 1000),
            },
            license: {
                IsLicensed: 'false',
            },
        };

        mockState = {...mockState, entities: {...mockState.entities, users: isAdminUser, admin: moreThan10Users, general: moreThan6Hours}};

        mount(
            <ShowStartTrialModal/>,
        );
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
});
