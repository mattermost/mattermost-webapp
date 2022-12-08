// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SidebarTypes} from 'mattermost-redux/action_types';
import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {
    insightsAreEnabled,
    isCollapsedThreadsEnabled,
    localDraftsAreEnabled
} from 'mattermost-redux/selectors/entities/preferences';

import {SidebarStaticItem} from '@mattermost/types/sidebar';

export function selectSidebarStaticItem(itemId: string) {
    return {
        type: SidebarTypes.SELECT_STATIC_ITEM,
        data: itemId,
    };
}

export function initSidebarStaticItems(): ActionFunc {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const items: SidebarStaticItem[] = [];

        if (insightsAreEnabled(state)) {
            items.push({
                id: 'activity-and-insights',
                name: 'Insights',
                isEnabled: true,
                isVisible: true,
            });
        }

        if (isCollapsedThreadsEnabled(state)) {
            items.push({
                id: 'threads',
                name: 'Threads',
                isEnabled: true,
                isVisible: true,
            });
        }

        if (localDraftsAreEnabled(state)) {
            items.push({
                id: 'drafts',
                name: 'Drafts',
                isEnabled: true,
                isVisible: true,
            });
        }

        dispatch({
            type: SidebarTypes.SET_STATIC_ITEMS,
            data: items,
        });

        return {data: true};
    };
}
