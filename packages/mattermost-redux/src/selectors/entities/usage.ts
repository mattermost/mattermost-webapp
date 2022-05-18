// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '@mattermost/types/store';
import {IntegrationsUsage} from '@mattermost/types/usage';

export function getIntegrationsUsage(state: GlobalState): IntegrationsUsage {
    return state.entities.usage.integrations;
}
