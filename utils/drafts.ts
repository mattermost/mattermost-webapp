// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PostDraft} from 'types/drafts';

const emptyDraft: PostDraft = {
    channelId: '',
    rootId: '',

    createAt: 0,
    updateAt: 0,

    message: '',
    fileInfos: [],
    uploadsInProgress: [],
};

export function getEmptyDraft() {
    return emptyDraft;
}

export function isDraftEmpty(draft?: PostDraft) {
    return !draft || (
        draft.message.trim() === '' &&
        draft.fileInfos.length === 0 &&
        draft.uploadsInProgress.length === 0
    );
}
