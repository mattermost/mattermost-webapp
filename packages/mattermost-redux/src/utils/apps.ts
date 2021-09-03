// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppBinding, AppField, AppForm} from '../types/apps';
import {AppBindingLocations, AppFieldTypes} from '../constants/apps';

export function cleanBinding(binding: AppBinding, topLocation: string) {
    cleanBindingRec(binding, topLocation, 0);
}

function cleanBindingRec(binding: AppBinding, topLocation: string, depth: number) {
    if (!binding) {
        return;
    }

    const toRemove: number[] = [];
    const usedLabels: {[label: string]: boolean} = {};
    binding.bindings?.forEach((b, i) => {
        // Inheritance and defaults
        if (!b.call && binding.call) {
            b.call = binding.call;
        }

        if (b.form) {
            cleanForm(b.form);
        } else if (binding.form) {
            b.form = binding.form;
        }

        if (!b.app_id) {
            b.app_id = binding.app_id;
        }

        if (!b.label) {
            b.label = b.location || '';
        }

        b.location = binding.location + '/' + b.location;

        // Validation
        if (!b.label) {
            toRemove.unshift(i);
            return;
        }

        switch (topLocation) {
        case AppBindingLocations.COMMAND: {
            if (b.label.match(/ |\t/)) {
                toRemove.unshift(i);
                return;
            }

            if (usedLabels[b.label]) {
                toRemove.unshift(i);
                return;
            }
            break;
        }
        case AppBindingLocations.CHANNEL_HEADER_ICON: {
            // First level of channel header icons must have an icon to show as the icon
            if (!b.icon && depth === 0) {
                toRemove.unshift(i);
                return;
            }
            break;
        }
        case AppBindingLocations.IN_POST: {
            if (usedLabels[b.label]) {
                toRemove.unshift(i);
                return;
            }
            break;
        }
        }

        if (b.bindings?.length) {
            cleanBindingRec(b, topLocation, depth + 1);

            // Remove invalid branches
            if (!b.bindings?.length) {
                toRemove.unshift(i);
                return;
            }
        } else {
            // Remove leaves without a call
            if (!b.call && !b.form?.call) {
                toRemove.unshift(i);
                return;
            }

            // Remove leaves without app id
            if (!b.app_id) {
                toRemove.unshift(i);
                return;
            }
        }

        usedLabels[b.label] = true;
    });

    toRemove.forEach((i) => {
        binding.bindings?.splice(i, 1);
    });
}

export function validateBindings(bindings: AppBinding[] = []): AppBinding[] {
    const channelHeaderBindings = bindings?.filter((b) => b.location === AppBindingLocations.CHANNEL_HEADER_ICON);
    const postMenuBindings = bindings?.filter((b) => b.location === AppBindingLocations.POST_MENU_ITEM);
    const commandBindings = bindings?.filter((b) => b.location === AppBindingLocations.COMMAND);

    channelHeaderBindings.forEach((b) => cleanBinding(b, AppBindingLocations.CHANNEL_HEADER_ICON));
    postMenuBindings.forEach((b) => cleanBinding(b, AppBindingLocations.POST_MENU_ITEM));
    commandBindings.forEach((b) => cleanBinding(b, AppBindingLocations.COMMAND));

    const hasBindings = (b: AppBinding) => b.bindings?.length;
    return postMenuBindings.filter(hasBindings).concat(channelHeaderBindings.filter(hasBindings), commandBindings.filter(hasBindings));
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
