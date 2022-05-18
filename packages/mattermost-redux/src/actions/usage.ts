// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UsageTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import {ActionFunc} from 'mattermost-redux/types/actions';

export function getIntegrationsUsage(): ActionFunc {
    return async (dispatch) => {
        const data = await Client4.getIntegrationsUsage();
        dispatch({
            type: UsageTypes.RECEIVED_INTEGRATIONS_USAGE,
            data,
        });

        return {data: true};
    };
}
