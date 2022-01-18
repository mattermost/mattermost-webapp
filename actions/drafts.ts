// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {PostDraft} from 'types/drafts';

import {ActionTypes} from 'utils/constants';

export function updatePostDraft(channelId: string, draft?: PostDraft) {
    const now = Date.now();

    return {
        type: ActionTypes.POST_DRAFT_UPDATED,
        channelId,
        draft: draft ? {
            ...draft,
            channelId,
            createAt: draft.createAt || now,
            updateAt: now,
        } : undefined,
    };
}

export function updateCommentDraft(rootId: string, draft?: PostDraft) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const rootPost = getPost(getState(), rootId);
        const channelId = rootPost.channel_id;

        const now = Date.now();

        return dispatch({
            type: ActionTypes.COMMENT_DRAFT_UPDATED,
            rootId,
            draft: draft ? {
                ...draft,
                channelId,
                rootId,
                createAt: draft.createAt || now,
                updateAt: now,
            } : undefined,
        });
    };
}
