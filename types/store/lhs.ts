// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type LhsViewState = {
    isOpen: boolean;

    // Static items (e.g. Threads, Insights, etc.)
    currentStaticItemId: string;
    staticItems: LhsStaticItem[];
}

export type LhsStaticItem = {
    id: string;
    isVisible: boolean;
}
