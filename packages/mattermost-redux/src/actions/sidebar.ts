// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SidebarTypes} from 'mattermost-redux/action_types';

export function selectSidebarStaticItem(itemId: string) {
    return {
        type: SidebarTypes.SELECT_STATIC_ITEM,
        data: itemId,
    };
}
