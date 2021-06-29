// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';
import {LHSItem} from 'utils/lhs_utils';

export function getIsLhsOpen(state: GlobalState): boolean {
    return state.views.lhs.isOpen;
}

export function getSelectedLHSItem(state: GlobalState): LHSItem {
    return state.views.lhs.selectedItem;
}
