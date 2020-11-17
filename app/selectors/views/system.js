// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function connectionErrorCount(state) {
    return state.views.system.websocketConnectionErrorCount;
}
