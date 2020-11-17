// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {showNextSteps, getSteps, isOnboardingHidden, nextStepsNotFinished} from './steps';

//
describe('components/next_steps_view/steps', () => {
    test('should not show next steps if not cloud', () => {
        const goodState = {
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

        expect(showNextSteps(goodState as any)).toBe(true);

        const badState = {
            ...goodState,

            entities: {
                ...goodState.entities,
                general: {
                    license: {
                        Cloud: 'false',
                    },
                },
            },
        };

        expect(showNextSteps(badState as any)).toBe(false);
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
                        'recommended_next_steps--invite_members': {
                            name: 'invite_members',
                            value: 'true',
                        },
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
        expect(getSteps(state as any)).toHaveLength(3);
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
