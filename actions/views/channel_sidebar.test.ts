// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'store';

import {isCategoryCollapsedFromStorage} from 'selectors/views/channel_sidebar';
import {getPrefix} from 'utils/storage_utils';

import * as Actions from './channel_sidebar';

describe('setCategoryCollapsed', () => {
    test('should save category expanded and category collapsed', async () => {
        const category1 = 'category1';
        const initialState = {
            users: {
                currentUserId: 'user1',
                profiles: {
                    user1: {},
                }
            }
        };

        const store = await configureStore(initialState);

        store.dispatch(Actions.setCategoryCollapsed(category1, true));

        expect(isCategoryCollapsedFromStorage(getPrefix(store.getState()), store.getState().storage.storage, category1)).toBe(true);

        store.dispatch(Actions.setCategoryCollapsed(category1, false));

        expect(isCategoryCollapsedFromStorage(getPrefix(store.getState()), store.getState().storage.storage, category1)).toBe(false);
    });
});
