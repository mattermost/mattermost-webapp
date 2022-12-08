// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '@mattermost/types/store';
import {SidebarStaticItem} from '@mattermost/types/sidebar';

export function getCurrentStaticItemId(state: GlobalState): string {
    return state.entities.sidebar.currentStaticItemId;
}

export function getStaticItems(state: GlobalState): SidebarStaticItem[] {
    return state.entities.sidebar.staticItems;
}
