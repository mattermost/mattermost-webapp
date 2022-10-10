// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from 'types/store';

import {getConfig, getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';

export function showPreviewOnCreateComment(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnCreateComment;
}

export function showPreviewOnCreatePost(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnCreatePost;
}

export function showPreviewOnEditChannelHeaderModal(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnEditChannelHeaderModal;
}

export function isVoiceMessagesEnabled(state: GlobalState): boolean {
    const config = getConfig(state);
    const fileAttachmentsEnabled = config.EnableFileAttachments === 'true';
    const voiceMessagesExperimentalEnabled = config.ExperimentalVoiceMessages === 'true';

    const voiceMessageFeatureFlagEnabled = getFeatureFlagValue(state, 'VoiceMessages') === 'true';

    // For testing
    return true;

    return (fileAttachmentsEnabled && voiceMessagesExperimentalEnabled && voiceMessageFeatureFlagEnabled);
}
