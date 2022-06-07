// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloudUsage, IntegrationsUsage} from '@mattermost/types/cloud';
import {GlobalState} from '@mattermost/types/store';

import {getCloudLimits} from './cloud';

export function getUsage(state: GlobalState): CloudUsage {
    return state.entities.usage;
}

export function getIntegrationsUsage(state: GlobalState): IntegrationsUsage {
    return getUsage(state).integrations;
}

export function isIntegrationsUsageAtLimit(state: GlobalState): boolean {
    const limit = getCloudLimits(state)?.integrations?.enabled;
    const usage = getIntegrationsUsage(state)?.enabled;
    return Boolean(limit && usage && usage >= limit);
}
