// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {showNextSteps} from './steps';

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
            },
        };

        expect(showNextSteps(state as any)).toBe(false);
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
                        'recommended_next_steps--complete_profile': {name: 'complete_profile', value: 'true'},
                        'recommended_next_steps--team_setup': {name: 'team_setup', value: 'true'},
                        'recommended_next_steps--invite_members': {name: 'invite_members', value: 'true'},
                    },
                },
            },
        };

        expect(showNextSteps(state as any)).toBe(false);
    });
});
