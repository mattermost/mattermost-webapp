// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import TestHelper from 'mattermost-redux/test/test_helper';
import * as Selectors from 'mattermost-redux/selectors/entities/i18n';

describe('Selectors.I18n', () => {
    describe('getCurrentUserLocale', () => {
        it('not logged in', () => {
            const state = {
                entities: {
                    users: {
                        currentUserId: '',
                        profiles: {},
                    },
                },
            };

            assert.equal(Selectors.getCurrentUserLocale(state, 'default'), 'default');
        });

        it('current user not loaded', () => {
            const currentUserId = TestHelper.generateId();
            const state = {
                entities: {
                    users: {
                        currentUserId,
                        profiles: {},
                    },
                },
            };

            assert.equal(Selectors.getCurrentUserLocale(state, 'default'), 'default');
        });

        it('current user without locale set', () => {
            const currentUserId = TestHelper.generateId();
            const state = {
                entities: {
                    users: {
                        currentUserId,
                        profiles: {
                            [currentUserId]: {locale: ''},
                        },
                    },
                },
            };

            assert.equal(Selectors.getCurrentUserLocale(state, 'default'), 'default');
        });

        it('current user with locale set', () => {
            const currentUserId = TestHelper.generateId();
            const state = {
                entities: {
                    users: {
                        currentUserId,
                        profiles: {
                            [currentUserId]: {locale: 'fr'},
                        },
                    },
                },
            };

            assert.equal(Selectors.getCurrentUserLocale(state, 'default'), 'fr');
        });
    });
});
