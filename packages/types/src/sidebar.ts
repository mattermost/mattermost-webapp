// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type SidebarState = {
    currentStaticItemId: string;
    staticItems: SidebarStaticItem[];
}

export type SidebarStaticItem = {
    id: string;
    name: string;
    isEnabled: boolean;
    isVisible: boolean;
}
