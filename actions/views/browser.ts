// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericAction} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

export function emitBrowserWindowResized(windowSize: string): GenericAction {
    return {
        type: ActionTypes.BROWSER_WINDOW_RESIZED,
        data: windowSize,
    };
}
