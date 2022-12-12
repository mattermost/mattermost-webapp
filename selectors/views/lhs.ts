// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';
import {LhsStaticItem} from 'types/store/lhs';

export function getCurrentLhsStaticItemId(state: GlobalState): string {
    return state.views.lhs.currentStaticItemId;
}

export function getLhsStaticItems(state: GlobalState): LhsStaticItem[] {
    return state.views.lhs.staticItems;
}
