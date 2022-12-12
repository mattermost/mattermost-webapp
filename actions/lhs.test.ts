// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'store';

import mergeObjects from '../packages/mattermost-redux/test/merge_objects';

import * as Actions from './lhs';
import {initStaticItems} from './lhs';

const currentUserId = 'currentUserId';
const initialState = {
    entities: {
        general: {
            config: {
                InsightsEnabled: 'false',
                FeatureFlagInsightsEnabled: 'false',
                CollapsedThreads: 'false',
                FeatureFlagCollapsedThreads: 'false',
                FeatureFlagGlobalDrafts: 'false',
            },
        },
        users: {
            currentUserId,
            profiles: {
                [currentUserId]: {
                    id: currentUserId,
                    roles: 'system_user',
                },
            },
        },
    },
    views: {
        lhs: {
            currentStaticItemId: '',
            staticItems: [],
        },
    },
};

describe('Actions.Lhs', () => {
    test('selectStaticItem', async () => {
        const testStore = configureStore({...initialState});
        await testStore.dispatch(Actions.selectStaticItem('test'));
        expect(testStore.getState().views.lhs.currentStaticItemId).toEqual('test');
    });

    describe('initStaticItems', () => {
        it('handles nothing enabled', async () => {
            const testStore = configureStore({...initialState});
            await testStore.dispatch(initStaticItems());
            expect(testStore.getState().views.lhs.staticItems.length).toBe(0);
        });

        it('handles insights', async () => {
            const testStore = configureStore(mergeObjects({...initialState}, {
                entities: {
                    general: {
                        config: {
                            InsightsEnabled: 'true',
                            FeatureFlagInsightsEnabled: 'true',
                        },
                    },
                },
            }));
            await testStore.dispatch(initStaticItems());
            expect(testStore.getState().views.lhs.staticItems.length).toBe(1);
            expect(testStore.getState().views.lhs.staticItems[0].id).toBe('activity-and-insights');
            expect(testStore.getState().views.lhs.staticItems[0].isVisible).toBeTruthy();
        });
    });

    it('handles threads - default off', async () => {
        const testStore = configureStore(mergeObjects({...initialState}, {
            entities: {
                general: {
                    config: {
                        CollapsedThreads: 'default_off',
                        FeatureFlagCollapsedThreads: 'true',
                    },
                },
            },
        }));
        await testStore.dispatch(initStaticItems());
        expect(testStore.getState().views.lhs.staticItems.length).toBe(0);
    });

    it('handles threads - default on', async () => {
        const testStore = configureStore(mergeObjects({...initialState}, {
            entities: {
                general: {
                    config: {
                        CollapsedThreads: 'default_on',
                        FeatureFlagCollapsedThreads: 'true',
                    },
                },
            },
        }));
        await testStore.dispatch(initStaticItems());
        expect(testStore.getState().views.lhs.staticItems.length).toBe(1);
        expect(testStore.getState().views.lhs.staticItems[0].id).toBe('threads');
        expect(testStore.getState().views.lhs.staticItems[0].isVisible).toBeTruthy();
    });

    it('handles drafts', async () => {
        const testStore = configureStore(mergeObjects({...initialState}, {
            entities: {
                general: {
                    config: {
                        FeatureFlagGlobalDrafts: 'true',
                    },
                },
            },
        }));
        await testStore.dispatch(initStaticItems());
        expect(testStore.getState().views.lhs.staticItems.length).toBe(1);
        expect(testStore.getState().views.lhs.staticItems[0].id).toBe('drafts');
        expect(testStore.getState().views.lhs.staticItems[0].isVisible).toBeFalsy();
    });
});
