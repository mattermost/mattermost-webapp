// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {AppsTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {bindClientFunc} from './helpers';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.

export function fetchAppBindings(userID: string, channelID: string): ActionFunc {
    return bindClientFunc({
        clientFunc: () => Client4.getAppsBindings(userID, channelID),
        onSuccess: AppsTypes.RECEIVED_APP_BINDINGS,
    });
}
