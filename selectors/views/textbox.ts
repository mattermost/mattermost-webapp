// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

export function showPreviewOnCreateComment(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnCreateComment;
}

export function showPreviewOnCreatePost(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnCreatePost;
}

export function showPreviewOnEditChannelHeaderModal(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnEditChannelHeaderModal;
}

export function isVoiceMessageEnabled(state: GlobalState): boolean {
    // return getFeatureFlagValue(state, 'VoiceMessage') === 'true';
    // TODO: remove this once the feature flag is added
    return true;
}
