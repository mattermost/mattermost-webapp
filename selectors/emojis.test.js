// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import mergeObjects from 'mattermost-redux/test/merge_objects';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import LocalStorageStore from 'stores/local_storage_store';

import {Preferences} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import * as Selectors from './emojis';

describe('getRecentEmojis', () => {
    const currentUserId = 'currentUserId';
    const baseState = {
        entities: {
            emojis: {
                customEmoji: {},
            },
            general: {
                config: {
                    EnableCustomEmojis: 'true',
                },
            },
            preferences: {
                myPreferences: {},
            },
            users: {
                currentUserId,
            },
        },
    };

    beforeEach(() => {
        localStorage.clear();
    });

    test('should return an empty array when there are no recent emojis in storage', () => {
        // Note that we unnecessarily copy the state in each of these tests. This is done because changing the local
        // storage isn't enough to make the selector recalculate on its own.
        const state = mergeObjects(baseState, {});

        expect(Selectors.getRecentEmojis(state)).toEqual([]);
    });

    test('should return the names of recent system emojis', () => {
        const recentEmojis = ['rage', 'nauseated_face', 'innocent', '+1', 'sob', 'grinning', 'mm'];
        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        const state = mergeObjects(baseState, {});

        expect(Selectors.getRecentEmojis(state)).toEqual(recentEmojis);
    });

    test('should return the names of recent custom emojis', () => {
        const recentEmojis = ['strawberry', 'flag-au', 'kappa', 'gitlab', 'thanks'];
        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        const state = mergeObjects(baseState, {
            entities: {
                emojis: {
                    customEmojis: recentEmojis.map((name) => TestHelper.getCustomEmojiMock({name})),
                },
            },
        });

        expect(Selectors.getRecentEmojis(state)).toEqual(recentEmojis);
    });

    test('should return the names of missing emojis so that they can be loaded later', () => {
        const recentEmojis = ['strawberry', 'flag-au', 'kappa', 'gitlab', 'thanks'];
        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        const state = mergeObjects(baseState, {});

        expect(Selectors.getRecentEmojis(state)).toEqual(recentEmojis);
    });

    describe('should return skin toned emojis in the user\'s current skin tone', () => {
        beforeEach(() => {
            const recentEmojis = [
                'strawberry',
                'astronaut_dark_skin_tone',
                'male-teacher',
                'nose_light_skin_tone',
                'red_haired_woman_medium_light_skin_tone',
                'point_up_medium_dark_skin_tone',
            ];
            LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);
        });

        test('with no skin tone set', () => {
            const state = mergeObjects(baseState, {});

            expect(Selectors.getRecentEmojis(state)).toEqual([
                'strawberry',
                'astronaut',
                'male-teacher',
                'nose',
                'red_haired_woman',
                'point_up',
            ]);
        });

        test('with default skin tone set', () => {
            const state = mergeObjects(baseState, {
                entities: {
                    preferences: {
                        myPreferences: {
                            [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: 'default'},
                        },
                    },
                },
            });

            expect(Selectors.getRecentEmojis(state)).toEqual([
                'strawberry',
                'astronaut',
                'male-teacher',
                'nose',
                'red_haired_woman',
                'point_up',
            ]);
        });

        test('with light skin tone set', () => {
            const state = mergeObjects(baseState, {
                entities: {
                    preferences: {
                        myPreferences: {
                            [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FB'},
                        },
                    },
                },
            });

            expect(Selectors.getRecentEmojis(state)).toEqual([
                'strawberry',
                'astronaut_light_skin_tone',
                'male-teacher_light_skin_tone',
                'nose_light_skin_tone',
                'red_haired_woman_light_skin_tone',
                'point_up_light_skin_tone',
            ]);
        });

        test('with medium light skin tone set', () => {
            const state = mergeObjects(baseState, {
                entities: {
                    preferences: {
                        myPreferences: {
                            [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FC'},
                        },
                    },
                },
            });

            expect(Selectors.getRecentEmojis(state)).toEqual([
                'strawberry',
                'astronaut_medium_light_skin_tone',
                'male-teacher_medium_light_skin_tone',
                'nose_medium_light_skin_tone',
                'red_haired_woman_medium_light_skin_tone',
                'point_up_medium_light_skin_tone',
            ]);
        });

        test('with medium skin tone set', () => {
            const state = mergeObjects(baseState, {
                entities: {
                    preferences: {
                        myPreferences: {
                            [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FD'},
                        },
                    },
                },
            });

            expect(Selectors.getRecentEmojis(state)).toEqual([
                'strawberry',
                'astronaut_medium_skin_tone',
                'male-teacher_medium_skin_tone',
                'nose_medium_skin_tone',
                'red_haired_woman_medium_skin_tone',
                'point_up_medium_skin_tone',
            ]);
        });

        test('with medium dark skin tone set', () => {
            const state = mergeObjects(baseState, {
                entities: {
                    preferences: {
                        myPreferences: {
                            [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FE'},
                        },
                    },
                },
            });

            expect(Selectors.getRecentEmojis(state)).toEqual([
                'strawberry',
                'astronaut_medium_dark_skin_tone',
                'male-teacher_medium_dark_skin_tone',
                'nose_medium_dark_skin_tone',
                'red_haired_woman_medium_dark_skin_tone',
                'point_up_medium_dark_skin_tone',
            ]);
        });

        test('with dark skin tone set', () => {
            const state = mergeObjects(baseState, {
                entities: {
                    preferences: {
                        myPreferences: {
                            [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FF'},
                        },
                    },
                },
            });

            expect(Selectors.getRecentEmojis(state)).toEqual([
                'strawberry',
                'astronaut_dark_skin_tone',
                'male-teacher_dark_skin_tone',
                'nose_dark_skin_tone',
                'red_haired_woman_dark_skin_tone',
                'point_up_dark_skin_tone',
            ]);
        });
    });

    test('should not change skin tone of emojis with multiple skin tones', () => {
        const recentEmojis = [
            'strawberry',
            'man_and_woman_holding_hands_medium_light_skin_tone_medium_dark_skin_tone',
        ];
        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        let state = baseState;

        expect(Selectors.getRecentEmojis(state)).toEqual(recentEmojis);

        state = mergeObjects(state, {
            preferences: {
                myPreferences: {
                    [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FB'},
                },
            },
        });

        expect(Selectors.getRecentEmojis(state)).toEqual(recentEmojis);
    });

    test('should de-duplicate results', () => {
        const recentEmojis = [
            'banana',
            'banana',
            'apple',
            'banana',
        ];
        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        const state = mergeObjects(baseState, {});

        expect(Selectors.getRecentEmojis(state)).toEqual(['banana', 'apple']);
    });

    test('should de-duplicate results with different skin tones', () => {
        const recentEmojis = [
            'ear',
            'ear_light_skin_tone',
            'ear_medium_light_skin_tone',
            'nose_dark_skin_tone',
            'nose_medium_dark_skin_tone',
            'nose_light_skin_tone',
        ];
        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        let state = baseState;

        expect(Selectors.getRecentEmojis(state)).toEqual(['ear', 'nose']);

        state = mergeObjects(state, {
            entities: {
                preferences: {
                    myPreferences: {
                        [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FE'},
                    },
                },
            },
        });

        expect(Selectors.getRecentEmojis(state)).toEqual(['ear_medium_dark_skin_tone', 'nose_medium_dark_skin_tone']);
    });

    test('should only recalculate if relevant state changes', () => {
        const recentEmojis = [
            'apple',
            'banana',
        ];
        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        let state = baseState;
        const previousResult = Selectors.getRecentEmojis(state);

        expect(Selectors.getRecentEmojis(state)).toBe(previousResult);

        state = mergeObjects(state, {
            preferences: {
                myPreferences: {
                    some_preference: {value: 'some value'},
                },
            },
        });

        expect(Selectors.getRecentEmojis(state)).toBe(previousResult);

        state = mergeObjects(state, {
            entities: {
                preferences: {
                    myPreferences: {
                        [getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE)]: {value: '1F3FE'},
                    },
                },
            },
        });

        expect(Selectors.getRecentEmojis(state)).not.toBe(previousResult);
    });
});
