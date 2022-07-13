// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {HostedTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {bindClientFunc} from './helpers';

export function getSelfHostedSubscription(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSelfHostedSubscription,
        onSuccess: [HostedTypes.RECEIVED_SELF_HOSTED_SUBSCRIPTION],
    });
}

export function getSelfHostedProducts(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSelfHostedProducts,
        onSuccess: [HostedTypes.RECEIVED_SELF_HOSTED_PRODUCTS],
    });
}
