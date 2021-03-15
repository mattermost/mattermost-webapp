// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import {AppBinding, AppCall, AppCallValues, AppExpand} from 'mattermost-redux/types/apps';
import {GlobalState} from 'mattermost-redux/types/store';

export function appsEnabled(state: GlobalState) {// eslint-disable-line @typescript-eslint/no-unused-vars
    // TODO uncomment when featur flag is in place
    //return getConfig(state)?.['FeatureFlagApps' as keyof Partial<ClientConfig>];
    return true;
}

export function fillBindingsInformation(binding?: AppBinding) {
    if (!binding) {
        return;
    }

    binding.bindings?.forEach((b) => {
        // Propagate id down if not defined
        if (!b.app_id) {
            b.app_id = binding.app_id;
        }

        // Compose location
        b.location = binding.location + '/' + b.location;

        // Propagate call down if not defined
        if (!b.call) {
            b.call = binding.call;
        }

        fillBindingsInformation(b);
    });

    // Trim branches without app_id
    if (!binding.app_id) {
        binding.bindings = binding.bindings?.filter((v) => v.app_id);
    }

    // Trim branches without calls
    if (!binding.call) {
        binding.bindings = binding.bindings?.filter((v) => v.call);
    }

    // Pull up app_id if needed
    if (binding.bindings?.length && !binding.app_id) {
        binding.app_id = binding.bindings[0].app_id;
    }

    // Pull up call if needed
    if (binding.bindings?.length && !binding.call) {
        binding.call = binding.bindings[0].call;
    }
}

export function createCallRequest(
    call: AppCall,
    userId: string,
    appId: string,
    location: string,
    expand: AppExpand = {},
    channelId = '',
    postId = '',
    type = '',
    rawCommand = '',
    values?: AppCallValues,
): AppCall {
    return {
        type,
        path: call.path,
        context: {
            ...call.context,
            acting_user_id: userId,
            app_id: appId,
            channel_id: channelId,
            location,
            post_id: postId,
            user_id: userId,
        },
        values: {
            ...call.values,
            ...values,
        },
        expand: {
            ...call.expand,
            ...expand,
        },
        raw_command: rawCommand,
    };
}

export const makeCallErrorResponse = (errMessage: string) => {
    return {
        type: AppCallResponseTypes.ERROR,
        error: errMessage,
    };
};
