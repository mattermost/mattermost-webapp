// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SidebarSize, SIDEBAR_SNAP_SIZE} from 'utils/constants';

export const isResizableSize = (size: SidebarSize) => size !== SidebarSize.SMALL;

export const isOverLimit = (newWidth: number, maxWidth: number, minWidth: number) => {
    return newWidth > maxWidth || newWidth < minWidth;
};

export const shouldSnapWhenSizeGrown = (newWidth: number, prevWidth: number, maxWidth: number) => {
    const diff = maxWidth - newWidth;
    const isGrowing = newWidth > prevWidth;

    return diff <= SIDEBAR_SNAP_SIZE && isGrowing;
};

export const shouldSnapWhenSizeShrunk = (newWidth: number, prevWidth: number, minWidth: number) => {
    const diff = newWidth - minWidth;
    const isShrinking = newWidth < prevWidth;

    return diff <= SIDEBAR_SNAP_SIZE && isShrinking;
};

export const shouldRhsOverlapChannelView = (size: SidebarSize) => size === SidebarSize.MEDIUM;
