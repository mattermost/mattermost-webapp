// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from '@mattermost/types/channels';
import {GlobalState as BaseGlobalState} from '@mattermost/types/store';
import {RelationOneToOne} from '@mattermost/types/utilities';

import {NewPostDraft} from './draft';
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
        storage: Record<string, any>;
        initialized: boolean;
    };
    views: ViewsState;
    drafts: {
        byChannel: RelationOneToOne<Channel, NewPostDraft>;
        byThread: RelationOneToOne<Channel, NewPostDraft>;
    };
};
