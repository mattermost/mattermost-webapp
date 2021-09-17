// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {addMessageIntoHistory} from 'mattermost-redux/actions/posts';
import {Preferences, Permissions} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {showPreviewOnEditPostModal} from 'selectors/views/textbox';
import {setShowPreviewOnEditPostModal} from 'actions/views/textbox';
import {unsetEditingPost} from 'actions/post_actions';
import {openModal} from 'actions/views/modals';
import {editPost} from 'actions/views/posts';
import {getEditingPost} from 'selectors/posts';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

import EditPost from './edit_post';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const editingPost = getEditingPost(state);
    const currentUserId = getCurrentUserId(state);
    const channelId = editingPost?.post?.channel_id || getCurrentChannelId(state);
    const teamId = getCurrentTeamId(state);
    let canDeletePost = false;
    let canEditPost = false;

    if (editingPost && editingPost.post && editingPost.post.user_id === currentUserId) {
        canDeletePost = haveIChannelPermission(state, teamId, channelId, Permissions.DELETE_POST);
        canEditPost = haveIChannelPermission(state, teamId, channelId, Permissions.EDIT_POST);
    } else {
        canDeletePost = haveIChannelPermission(state, teamId, channelId, Permissions.DELETE_OTHERS_POSTS);
        canEditPost = haveIChannelPermission(state, teamId, channelId, Permissions.EDIT_OTHERS_POSTS);
    }

    const useChannelMentions = haveIChannelPermission(state, teamId, channelId, Permissions.USE_CHANNEL_MENTIONS);

    return {
        canEditPost,
        canDeletePost,
        codeBlockOnCtrlEnter: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        config,
        editingPost,
        channelId,
        shouldShowPreview: showPreviewOnEditPostModal(state),
        maxPostSize: config.MaxPostSize ? parseInt(config.MaxPostSize, 10) : Constants.DEFAULT_CHARACTER_LIMIT,
        useChannelMentions,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            addMessageIntoHistory,
            editPost,
            unsetEditingPost,
            openModal,
            setShowPreview: setShowPreviewOnEditPostModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPost);
