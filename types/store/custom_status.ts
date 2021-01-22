// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type CustomStatus = {
    emoji: string;
    text: string;
}

export type CustomStatusInitialisationState = {
    hasClickedUpdateStatusBefore: boolean;
    hasClickedSidebarHeaderFirstTime: boolean;
    menuOpenedOnClick: string;
}
