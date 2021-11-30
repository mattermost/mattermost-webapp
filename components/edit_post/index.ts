// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {addMessageIntoHistory} from 'mattermost-redux/actions/posts';
import {Preferences, Permissions} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {unsetEditingPost} from 'actions/post_actions';
import {openModal} from 'actions/views/modals';
import {scrollPostListToBottom} from 'actions/views/channel';
import {editPost} from 'actions/views/posts';
import {getEditingPost} from 'selectors/posts';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

import EditPost, {Actions} from './edit_post';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const editingPost = getEditingPost(state);
    const currentUserId = getCurrentUserId(state);
    const channelId = editingPost?.post?.channel_id || getCurrentChannelId(state);
    const teamId = getCurrentTeamId(state);

    const isAuthor = editingPost?.post?.user_id === currentUserId;
    const deletePermission = isAuthor ? Permissions.DELETE_POST : Permissions.DELETE_OTHERS_POSTS;
    const editPermission = isAuthor ? Permissions.EDIT_POST : Permissions.EDIT_OTHERS_POSTS;

    const channel = state.entities.channels.channels[channelId] || {};
    const useChannelMentions = haveIChannelPermission(state, teamId, channelId, Permissions.USE_CHANNEL_MENTIONS);

    return {
        canEditPost: haveIChannelPermission(state, teamId, channelId, deletePermission),
        canDeletePost: haveIChannelPermission(state, teamId, channelId, editPermission),
        codeBlockOnCtrlEnter: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        config,
        editingPost,
        channelId,
        maxPostSize: parseInt(config.MaxPostSize || '0', 10) || Constants.DEFAULT_CHARACTER_LIMIT,
        readOnlyChannel: !isCurrentUserSystemAdmin(state) && config.ExperimentalTownSquareIsReadOnly === 'true' && channel.name === Constants.DEFAULT_CHANNEL,
        useChannelMentions,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            scrollPostListToBottom,
            addMessageIntoHistory,
            editPost,
            unsetEditingPost,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPost);
