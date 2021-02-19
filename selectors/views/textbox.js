// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function showPreviewOnCreateComment(state) {
    return state.views.textbox.shouldShowPreviewOnCreateComment;
}

export function showPreviewOnCreatePost(state) {
    return state.views.textbox.shouldShowPreviewOnCreatePost;
}

export function showPreviewOnEditChannelHeaderModal(state) {
    return state.views.textbox.shouldShowPreviewOnEditChannelHeaderModal;
}

export function showPreviewOnEditPostModal(state) {
    return state.views.textbox.shouldShowPreviewOnEditPostModal;
}
