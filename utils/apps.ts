// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppBinding} from 'mattermost-redux/types/apps';

export function fillBindingsInformation(binding: AppBinding) {
    binding.bindings?.forEach((b) => {
        b.app_id = binding.app_id;
        b.location = binding.location + '/' + b.location;
        if (!b.call) {
            b.call = binding.call;
        }
        fillBindingsInformation(b);
    });
}
