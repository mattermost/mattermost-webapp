// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {showNextSteps, getSteps, isOnboardingHidden, nextStepsNotFinished} from './steps';

//
describe('components/next_steps_view/steps', () => {
    test('should show next steps', () => {
        const cloudState = {
            entities: {
                general: {
                    license: {
                        Cloud: 'true',
                    },
                },
                preferences: {
                    myPreferences: {},
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_role'},
                    },
                },
            },
        };

        expect(showNextSteps(cloudState as any)).toBe(true);

        const nonCloudState = {
            ...cloudState,

            entities: {
                ...cloudState.entities,
                general: {
                    license: {
                        Cloud: 'false',
                    },
                },
            },
        };

        expect(showNextSteps(nonCloudState as any)).toBe(true);
    });

    test('should not show the view if hide preference exists', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        Cloud: 'true',
                    },
                },
                preferences: {
                    myPreferences: {
                        'recommended_next_steps--hide': {name: 'hide', value: 'true'},
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_role'},
                    },
                },
            },
        };

        expect(isOnboardingHidden(state as any)).toBe(true);
    });

    test('should not show the view if all steps are complete', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        Cloud: 'true',
                    },
                },
                preferences: {
                    myPreferences: {
                        'recommended_next_steps--complete_profile': {
                            name: 'complete_profile',
                            value: 'true',
                        },
                        'recommended_next_steps--team_setup': {
                            name: 'team_setup',
                            value: 'true',
                        },
                        'recommended_next_steps--notification_setup': {
                            name: 'notification_setup',
                            value: 'true',
                        },
                        'recommended_next_steps--invite_members': {
                            name: 'invite_members',
                            value: 'true',
                        },
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_user'},
                    },
                },
            },
        };

        expect(nextStepsNotFinished(state as any)).toBe(true);
    });

    test('should only show admin steps for admin users', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        Cloud: 'true',
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_admin system_user'},
                    },
                },
            },
        };
        expect(getSteps(state as any)).toHaveLength(5);
    });

    test('should only show the complete_profile_step to guest users', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        Cloud: 'true',
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_guest'},
                    },
                },
            },
        };
        expect(getSteps(state as any)).toHaveLength(1);
    });

    test('should only show non-admin steps for non-admin users', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        Cloud: 'true',
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_user'},
                    },
                },
            },
        };
        expect(getSteps(state as any)).toHaveLength(3);
    });
});
