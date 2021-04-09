// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState as BaseGlobalState} from 'mattermost-redux/types/store';
import {Dictionary} from 'mattermost-redux/types/utilities';

import {PluginsState} from './plugins';
import {ViewsState} from './views';

export type DraggingState = {
    state?: string;
    type?: string;
    id?: string;
}

export type GlobalState = BaseGlobalState & {
    plugins: PluginsState;
    storage: {
        storage: Dictionary<any>;
        initialized: boolean;
    };

    views: ViewsState;
};
