// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';

import {getEmptyDraft, isDraftEmpty} from 'utils/drafts';

export function getPostDraft(state: GlobalState, channelId: string) {
    return state.drafts.postDrafts[channelId] || getEmptyDraft();
}

export function hasPostDraft(state: GlobalState, channelId: string) {
    return !isDraftEmpty(getPostDraft(state, channelId));
}

export function getCommentDraft(state: GlobalState, rootId: string) {
    return state.drafts.commentDrafts[rootId] || getEmptyDraft();
}
