// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GlobalState} from 'mattermost-redux/types/store';
import {AppBinding} from 'mattermost-redux/types/apps';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.
export function getAppBindings(state: GlobalState, location?: string): AppBinding[] {
    if (!state.entities.apps.bindings) {
        return [];
    }

    if (location) {
        const headerBindings = state.entities.apps.bindings.filter((b) => b.location === location);
        return headerBindings.reduce((accum: AppBinding[], current: AppBinding) => accum.concat(current.bindings || []), []);
    }
    return state.entities.apps.bindings;
}
