// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';
import {getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';

export function getGlobalHeaderEnabled(state: GlobalState): boolean {
    return getFeatureFlagValue(state, 'GlobalHeader') === 'true';
}
