// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from 'utils/constants';

import {GlobalState} from 'types/store';
import {ViewsState} from 'types/store/views';

export function getBrowserWindowSize(state: GlobalState): ViewsState['browser']['windowSize'] {
    return state.views.browser.windowSize;
}

export function getIsDesktopView(state: GlobalState): boolean {
    const width = state.views.browser.windowSize.width;
    return width > Constants.DESKTOP_SCREEN_WIDTH;
}

export function getIsSmallDesktopView(state: GlobalState): boolean {
    const width = state.views.browser.windowSize.width;
    return width > Constants.TABLET_SCREEN_WIDTH && width <= Constants.DESKTOP_SCREEN_WIDTH;
}

export function getIsTabletView(state: GlobalState): boolean {
    const width = state.views.browser.windowSize.width;
    return width > Constants.MOBILE_SCREEN_WIDTH && width <= Constants.TABLET_SCREEN_WIDTH;
}

export function getIsMobileView(state: GlobalState): boolean {
    const width = state.views.browser.windowSize.width;
    return width <= Constants.MOBILE_SCREEN_WIDTH;
}
