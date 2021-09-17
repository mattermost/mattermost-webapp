// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '../../types/store';

export function getIsPostBeingEdited(state: GlobalState, postId: string): boolean {
    return state.views.posts.editingPost.postId === postId;
}
