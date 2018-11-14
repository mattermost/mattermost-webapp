// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentLocale, getTranslations} from 'selectors/i18n';

describe('selectors/i18n', () => {
    describe('getCurrentLocale', () => {
        test('not logged in', () => {
            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'fr',
                        },
                    },
                    users: {
                        currentUserId: '',
                        profiles: {},
                    },
                },
            };

            expect(getCurrentLocale(state)).toEqual('fr');
        });

        test('not logged in', () => {
            const state = {
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'fr',
                        },
                    },
                    users: {
                        currentUserId: 'abcd',
                        profiles: {
                            abcd: {
                                locale: 'de',
                            },
                        },
                    },
                },
            };

            expect(getCurrentLocale(state)).toEqual('de');
        });
    });

    describe('getTranslations', () => {
        const state = {
            views: {
                i18n: {
                    translations: {
                        en: {
                            'test.hello_world': 'Hello, World!',
                        },
                    },
                },
            },
        };

        test('returns loaded translations', () => {
            expect(getTranslations(state, 'en')).toBe(state.views.i18n.translations.en);
        });

        test('returns null for unloaded translations', () => {
            expect(getTranslations(state, 'fr')).toEqual(undefined); // eslint-disable-line no-undefined
        });

        test('returns English translations for unsupported locale', () => {
            // This test will have to be changed if we add support for Gaelic
            expect(getTranslations(state, 'gd')).toBe(state.views.i18n.translations.en);
        });
    });
});
