// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'store';

import {isCategoryCollapsedFromStorage} from 'selectors/views/channel_sidebar';

import * as Actions from './channel_sidebar';

describe('setCategoryCollapsed', () => {
    test('should save category expanded and category collapsed', async () => {
        const category1 = 'category1';

        const store = await configureStore();

        store.dispatch(Actions.setCategoryCollapsed(category1, true));

        expect(isCategoryCollapsedFromStorage(store.getState(), category1)).toBe(true);

        store.dispatch(Actions.setCategoryCollapsed(category1, false));

        expect(isCategoryCollapsedFromStorage(store.getState(), category1)).toBe(false);
    });
});
