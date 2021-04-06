// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {ClientConfig} from 'mattermost-redux/types/config';
import {GlobalState} from 'mattermost-redux/types/store';

export function appsEnabled(state: GlobalState): boolean {
    const enabled = getConfig(state)?.['FeatureFlagAppsEnabled' as keyof Partial<ClientConfig>];
    return enabled === 'true';
}
