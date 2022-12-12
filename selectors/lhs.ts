// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {GlobalState} from 'types/store';
import {makeGetDraftsCount} from 'selectors/drafts';

import {getLhsStaticItems} from './views/lhs';

export function getIsLhsOpen(state: GlobalState): boolean {
    return state.views.lhs.isOpen;
}

export const getVisibleLhsStaticItems = createSelector(
    'getVisibleSidebarStaticItems',
    (state: GlobalState) => getLhsStaticItems(state),
    (state: GlobalState) => {
        const getDraftsCount = makeGetDraftsCount();
        return getDraftsCount(state);
    },
    (staticItems, draftsCount) => {
        return staticItems.map((item) => {
            if (item.id === 'drafts') {
                return {
                    ...item,
                    isVisible: draftsCount > 0,
                };
            }
            return item;
        }).filter((item) => item.isVisible);
    },
);
