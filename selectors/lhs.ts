// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {GlobalState} from 'types/store';
import {LhsStaticItem} from 'types/store/lhs';

import {makeGetDraftsCount} from './drafts';
import {getLhsStaticItems} from './views/lhs';

const getDraftsCount = makeGetDraftsCount();

export function getIsLhsOpen(state: GlobalState): boolean {
    return state.views.lhs.isOpen;
}

export function getVisibleLhsStaticItems(): (state: GlobalState) => LhsStaticItem[] {
    return createSelector(
        'getVisibleSidebarStaticItems',
        (state: GlobalState) => getLhsStaticItems(state),
        (state: GlobalState) => getDraftsCount(state),
        (staticItems, draftsCount) => {
            return staticItems.map((item) => {
                if (item.id === 'drafts') {
                    return {
                        ...item,
                        isVisible: draftsCount > 0,
                    };
                }
                return item;
            });
        },
    );
}
