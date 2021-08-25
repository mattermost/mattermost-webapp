// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';
import {getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';
import * as UserAgent from '../utils/user_agent';
import * as Utils from '../utils/utils';

export function getGlobalHeaderEnabled(state: GlobalState): boolean {
    const featureFlagEnabled = getFeatureFlagValue(state, 'GlobalHeader') === 'true';
    const isMobileView = UserAgent.isMobile() || Utils.isMobile();

    return !isMobileView && featureFlagEnabled;
}
