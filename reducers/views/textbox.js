// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes} from 'utils/constants';

function shouldShowPreviewOnCreateComment(state = false, action) {
    switch (action.type) {
    case ActionTypes.SET_SHOW_PREVIEW_ON_CREATE_COMMENT:
        return action.showPreview;
    default:
        return state;
    }
}

function shouldShowPreviewOnCreatePost(state = false, action) {
    switch (action.type) {
    case ActionTypes.SET_SHOW_PREVIEW_ON_CREATE_POST:
        return action.showPreview;
    default:
        return state;
    }
}

function shouldShowPreviewOnEditChannelHeaderModal(state = false, action) {
    switch (action.type) {
    case ActionTypes.SET_SHOW_PREVIEW_ON_EDIT_CHANNEL_HEADER_MODAL:
        return action.showPreview;
    default:
        return state;
    }
}

function shouldShowPreviewOnEditPostModal(state = false, action) {
    switch (action.type) {
    case ActionTypes.SET_SHOW_PREVIEW_ON_EDIT_POST_MODAL:
        return action.showPreview;
    default:
        return state;
    }
}

export default combineReducers({
    shouldShowPreviewOnCreateComment,
    shouldShowPreviewOnCreatePost,
    shouldShowPreviewOnEditChannelHeaderModal,
    shouldShowPreviewOnEditPostModal,
});
