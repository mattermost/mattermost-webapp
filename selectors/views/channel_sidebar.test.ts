// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {setCategoryCollapsed, setUnreadFilterEnabled} from 'actions/views/channel_sidebar';

import configureStore from 'store';

import * as Selectors from './channel_sidebar';

describe('isCategoryCollapsed', () => {
    const category1 = 'category1';
    const category2 = 'category2';

    test('should return false by default', async () => {
        const store = await configureStore();

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(false);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(false);
    });

    test('should return true when category is explicitly collapsed', async () => {
        const store = await configureStore();

        store.dispatch(setCategoryCollapsed(category1, true));

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(true);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(false);

        store.dispatch(setCategoryCollapsed(category1, false));

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(false);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(false);
    });

    test('should return true when the unread filter is enabled', async () => {
        const store = await configureStore();

        store.dispatch(setUnreadFilterEnabled(true));

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(true);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(true);

        store.dispatch(setUnreadFilterEnabled(false));

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(false);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(false);
    });
});
