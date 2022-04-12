// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Limits} from 'mattermost-redux/types/cloud';
import {GlobalState} from 'mattermost-redux/types/store';

export function getCloudLimits(state: GlobalState): Limits {
    return state.entities.cloud.limits;
}
