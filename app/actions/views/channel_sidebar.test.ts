// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CategorySorting} from 'mattermost-redux/types/channel_categories';
import {insertWithoutDuplicates} from 'mattermost-redux/utils/array_utils';

import configureStore from 'store';

import {isCategoryCollapsed} from 'selectors/views/channel_sidebar';

import * as Actions from './channel_sidebar';

describe('setCategoryCollapsed', () => {
    test('should save category expanded and category collapsed', () => {
        const category1 = 'category1';
        const initialState = {
            entities: {
                users: {
                    currentUserId: 'user1',
                    profiles: {
                        user1: {},
                    },
                },
            },
        };

        const store = configureStore(initialState);

        store.dispatch(Actions.setCategoryCollapsed(category1, true));

        expect(isCategoryCollapsed(store.getState(), category1)).toBe(true);

        store.dispatch(Actions.setCategoryCollapsed(category1, false));

        expect(isCategoryCollapsed(store.getState(), category1)).toBe(false);
    });
});

describe('adjustTargetIndexForMove', () => {
    const channelIds = ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'];

    const initialState = {
        entities: {
            channelCategories: {
                byId: {
                    category1: {
                        id: 'category1',
                        channel_ids: channelIds,
                        sorting: CategorySorting.Manual,
                    },
                },
            },
            channels: {
                channels: {
                    new: {id: 'new', delete_at: 0},
                    one: {id: 'one', delete_at: 0},
                    twoDeleted: {id: 'twoDeleted', delete_at: 1},
                    three: {id: 'three', delete_at: 0},
                    four: {id: 'four', delete_at: 0},
                    fiveDeleted: {id: 'fiveDeleted', delete_at: 1},
                    six: {id: 'six', delete_at: 0},
                    seven: {id: 'seven', delete_at: 0},
                },
            },
        },
    };

    describe('should place newly added channels correctly in the category', () => {
        const testCases = [
            {
                inChannelIds: ['new', 'one', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['new', 'one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'new', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'new', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'new', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'new', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'new', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'new', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'new', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'new', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'seven', 'new'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven', 'new'],
            },
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            test('at ' + i, async () => {
                const store = configureStore(initialState);

                const targetIndex = testCase.inChannelIds.indexOf('new');

                const newIndex = Actions.adjustTargetIndexForMove(store.getState(), 'category1', 'new', targetIndex);

                const actualChannelIds = insertWithoutDuplicates(channelIds, 'new', newIndex);
                expect(actualChannelIds).toEqual(testCase.expectedChannelIds);
            });
        }
    });

    describe('should be able to move channels forwards', () => {
        const testCases = [
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['three', 'one', 'four', 'six', 'seven'],
                expectedChannelIds: ['twoDeleted', 'three', 'one', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['three', 'four', 'one', 'six', 'seven'],
                expectedChannelIds: ['twoDeleted', 'three', 'four', 'one', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['three', 'four', 'six', 'one', 'seven'],
                expectedChannelIds: ['twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'one', 'seven'],
            },
            {
                inChannelIds: ['three', 'four', 'six', 'seven', 'one'],
                expectedChannelIds: ['twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven', 'one'],
            },
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            test('at ' + i, async () => {
                const store = configureStore(initialState);

                const targetIndex = testCase.inChannelIds.indexOf('one');

                const newIndex = Actions.adjustTargetIndexForMove(store.getState(), 'category1', 'one', targetIndex);

                const actualChannelIds = insertWithoutDuplicates(channelIds, 'one', newIndex);
                expect(actualChannelIds).toEqual(testCase.expectedChannelIds);
            });
        }
    });

    describe('should be able to move channels backwards', () => {
        const testCases = [
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'seven', 'six'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'seven', 'fiveDeleted', 'six'],
            },
            {
                inChannelIds: ['one', 'three', 'seven', 'four', 'six'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'seven', 'four', 'fiveDeleted', 'six'],
            },
            {
                inChannelIds: ['one', 'seven', 'three', 'four', 'six'],
                expectedChannelIds: ['one', 'seven', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six'],
            },
            {
                inChannelIds: ['seven', 'one', 'three', 'four', 'six'],
                expectedChannelIds: ['seven', 'one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six'],
            },
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            test('at ' + i, async () => {
                const store = configureStore(initialState);

                const targetIndex = testCase.inChannelIds.indexOf('seven');

                const newIndex = Actions.adjustTargetIndexForMove(store.getState(), 'category1', 'seven', targetIndex);

                const actualChannelIds = insertWithoutDuplicates(channelIds, 'seven', newIndex);
                expect(actualChannelIds).toEqual(testCase.expectedChannelIds);
            });
        }
    });
});
