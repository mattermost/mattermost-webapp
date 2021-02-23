// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GlobalState} from 'types/store';

export function isStatusDropdownOpen(state: GlobalState) {
    return state.views.statusDropdown.isOpen;
}
