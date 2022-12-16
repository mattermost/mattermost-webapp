// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type LhsViewState = {
    isOpen: boolean;

    // Static pages (e.g. Threads, Insights, etc.)
    currentStaticPageId: string;
}

export type StaticPage = {
    id: string;
    isVisible: boolean;
}

