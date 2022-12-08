// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getSidebarStaticItems} from 'mattermost-redux/selectors/entities/sidebar';
import {createSelector} from 'reselect';
import {GlobalState} from 'types/store';

import {SidebarStaticItem} from '@mattermost/types/sidebar';

import {makeGetDraftsCount} from './drafts';

const getDraftsCount = makeGetDraftsCount();

export function getVisibleSidebarStaticItems(): (state: GlobalState) => SidebarStaticItem[] {
    return createSelector(
        'getVisibleSidebarStaticItems',
        (state: GlobalState) => getSidebarStaticItems(state),
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
