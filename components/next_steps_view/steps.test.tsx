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

    test('myPreferences all completed and nextStepsNotFinished is false', () => {
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
                        'recommended_next_steps--download_apps': {
                            name: 'download_apps',
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

        // all the steps are finished
        expect(nextStepsNotFinished(state as any)).toBe(false);
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

    test('should only show the complete_profile_step and download_apps to guest users', () => {
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
        const steps = getSteps(state as any);
        expect(steps).toHaveLength(2);
        expect(steps[0].id).toEqual('complete_profile');
        expect(steps[1].id).toEqual('download_apps');
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
        expect(getSteps(state as any)).toHaveLength(4);
    });

    test('should show the create first channel step if exposed to CreateFirstChannel treatment', () => {
        const state = {
            entities: {
                general: {
                    config: {
                        FeatureFlagGuidedChannelCreation: 'true',
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_admin'},
                    },
                },
            },
        };
        expect(getSteps(state as any).some((step) => step.id === RecommendedNextSteps.CREATE_FIRST_CHANNEL)).toBe(true);
    });
    test('should not show the create first channel step if feature flag missing', () => {
        const state = {
            entities: {
                general: {
                    config: {
                    },
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: ''},
                    },
                },
            },
        };
        expect(getSteps(state as any).some((step) => step.id === RecommendedNextSteps.CREATE_FIRST_CHANNEL)).toBe(false);
    });
});
