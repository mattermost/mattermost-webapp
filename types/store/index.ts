// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {GlobalState as BaseGlobalState} from 'mattermost-redux/types/store';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {PostDraft} from 'types/drafts';

import {PluginsState} from './plugins';
import {ViewsState} from './views';

export type DraggingState = {
    state?: string;
    type?: string;
    id?: string;
}

export type GlobalState = BaseGlobalState & {
    drafts: {
        commentDrafts: RelationOneToOne<Post, PostDraft>;
        postDrafts: RelationOneToOne<Channel, PostDraft>;
    };
    plugins: PluginsState;
    storage: {
        storage: Record<string, any>;
        initialized: boolean;
    };

    views: ViewsState;
};
