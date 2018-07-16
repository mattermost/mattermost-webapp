// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

export const makeGetSocketStatus = () => createSelector(
    (state) => state.views.websocket,
    (socketStatus) => socketStatus
);
