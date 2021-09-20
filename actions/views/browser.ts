// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericAction} from 'mattermost-redux/types/actions';

import {Constants, ActionTypes, WindowSizes} from 'utils/constants';

export function emitBrowserWindowResized(): GenericAction {
    const width = window.innerWidth;

    let windowSize;
    switch (true) {
    case width > Constants.TABLET_SCREEN_WIDTH && width <= Constants.DESKTOP_SCREEN_WIDTH: {
        windowSize = WindowSizes.SMALL_DESKTOP_VIEW;
        break;
    }
    case width > Constants.MOBILE_SCREEN_WIDTH && width <= Constants.TABLET_SCREEN_WIDTH: {
        windowSize = WindowSizes.TABLET_VIEW;
        break;
    }
    case width <= Constants.MOBILE_SCREEN_WIDTH: {
        windowSize = WindowSizes.MOBILE_VIEW;
        break;
    }
    default: {
        windowSize = WindowSizes.DESKTOP_VIEW; // width > Constants.DESKTOP_SCREEN_WIDTH
    }
    }

    return {
        type: ActionTypes.BROWSER_WINDOW_RESIZED,
        data: windowSize,
    };
}
