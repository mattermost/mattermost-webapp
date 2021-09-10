// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants';

export function emitBrowserWindowResized() {
    return {
        type: ActionTypes.BROWSER_WINDOW_RESIZED,
        windowSize: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
    };
}
