// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppCallResponseTypes, AppFieldTypes} from 'mattermost-redux/constants/apps';
import {AppBinding, AppCall, AppCallRequest, AppCallValues, AppContext, AppExpand, AppField, AppForm} from 'mattermost-redux/types/apps';

export const appsPluginID = 'com.mattermost.apps';

export function fillBindingsInformation(binding?: AppBinding) {
    if (!binding) {
        return;
    }

    cleanForm(binding.form);

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

export function cleanForm(form?: AppForm) {
    if (!form) {
        return;
    }

    const toRemove: number[] = [];
    const usedLabels: {[label: string]: boolean} = {};
    form.fields?.forEach((field, i) => {
        if (!field.name) {
            toRemove.unshift(i);
            return;
        }

        if (field.name.match(/ |\t/)) {
            toRemove.unshift(i);
            return;
        }

        let label = field.label;
        if (!label) {
            label = field.name;
        }

        if (label.match(/ |\t/)) {
            toRemove.unshift(i);
            return;
        }

        if (usedLabels[label]) {
            toRemove.unshift(i);
            return;
        }

        if (field.type === AppFieldTypes.STATIC_SELECT) {
            cleanStaticSelect(field);
            if (!field.options?.length) {
                toRemove.unshift(i);
                return;
            }
        }

        usedLabels[label] = true;
    });

    toRemove.forEach((i) => {
        form.fields.splice(i, 1);
    });
}

function cleanStaticSelect(field: AppField) {
    const toRemove: number[] = [];
    const usedLabels: {[label: string]: boolean} = {};
    const usedValues: {[label: string]: boolean} = {};
    field.options?.forEach((option, i) => {
        let label = option.label;
        if (!label) {
            label = option.value;
        }

        if (!label) {
            toRemove.unshift(i);
            return;
        }

        if (usedLabels[label]) {
            toRemove.unshift(i);
            return;
        }

        if (usedValues[option.value]) {
            toRemove.unshift(i);
            return;
        }

        usedLabels[label] = true;
        usedValues[option.value] = true;
    });

    toRemove.forEach((i) => {
        field.options?.splice(i, 1);
    });
}

export function cleanCommands(bindings: AppBinding[]) {
    const toRemove: number[] = [];
    const usedLabels: {[label: string]: boolean} = {};
    bindings.forEach((b, i) => {
        let label: string | undefined = b.label;
        if (!label) {
            label = b.location;
        }

        if (!label) {
            toRemove.unshift(i);
            return;
        }

        if (label.match(/ |\t/)) {
            toRemove.unshift(i);
            return;
        }

        if (usedLabels[label]) {
            toRemove.unshift(i);
            return;
        }

        if (b.bindings?.length) {
            cleanCommands(b.bindings);
            if (!b.bindings?.length) {
                toRemove.unshift(i);
                return;
            }
        }
        usedLabels[label] = true;
    });

    toRemove.forEach((i) => {
        bindings.splice(i, 1);
    });
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
