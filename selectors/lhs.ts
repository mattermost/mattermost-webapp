// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';
import {SidebarSize} from 'utils/constants';

export function getIsLhsOpen(state: GlobalState): boolean {
    return state.views.lhs.isOpen;
}

export function getLhsSize(state: GlobalState): SidebarSize {
    return state.views.lhs.size;
}
