// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {
    insightsAreEnabled,
    isCollapsedThreadsEnabled,
    localDraftsAreEnabled,
} from 'mattermost-redux/selectors/entities/preferences';
import {LhsStaticItem} from 'types/store/lhs';

import {ActionTypes} from '../utils/constants';

export function selectStaticItem(itemId: string) {
    return {
        type: ActionTypes.SELECT_LHS_STATIC_ITEM,
        data: itemId,
    };
}

export function initStaticItems(): ActionFunc {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const items: LhsStaticItem[] = [];

        if (insightsAreEnabled(state)) {
            items.push({
                id: 'activity-and-insights',
                isVisible: true,
            });
        }

        if (isCollapsedThreadsEnabled(state)) {
            items.push({
                id: 'threads',
                isVisible: true,
            });
        }

        if (localDraftsAreEnabled(state)) {
            items.push({
                id: 'drafts',
                isVisible: false,
            });
        }

        dispatch({
            type: ActionTypes.SET_LHS_STATIC_ITEMS,
            data: items,
        });

        return {data: true};
    };
}
