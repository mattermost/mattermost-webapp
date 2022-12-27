// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';

export const isNotificationsPermissionGranted = (state: GlobalState) => state.views.browser.isNotificationsPermissionGranted;
