// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import {AppBinding, AppCall, AppCallRequest, AppCallValues, AppContext, AppExpand} from 'mattermost-redux/types/apps';

export const appsPluginID = 'com.mattermost.apps';

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

export function createCallContext(
    appID: string,
    location?: string,
    channelID?: string,
    teamID?: string,
    postID?: string,
    rootID?: string,
): AppContext {
    return {
        app_id: appID,
        location,
        channel_id: channelID,
        team_id: teamID,
        post_id: postID,
        root_id: rootID,
    };
}

export function createCallRequest(
    call: AppCall,
    context: AppContext,
    defaultExpand: AppExpand = {},
    values?: AppCallValues,
    rawCommand?: string,
    query?: string,
    selectedField?: string,
): AppCallRequest {
    return {
        ...call,
        context,
        values,
        expand: {
            ...defaultExpand,
            ...call.expand,
        },
        raw_command: rawCommand,
        query,
        selected_field: selectedField,
    };
}

export const makeCallErrorResponse = (errMessage: string) => {
    return {
        type: AppCallResponseTypes.ERROR,
        error: errMessage,
    };
};
