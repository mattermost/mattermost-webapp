// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {isChannelReadOnlyById, getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {addReaction} from 'mattermost-redux/actions/posts';

import {isEmbedVisible} from 'selectors/posts';

import RhsRootPost from './rhs_root_post.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const enableEmojiPicker = config.EnableEmojiPicker === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const teamId = ownProps.teamId || getCurrentTeamId(state);
    const channel = getChannel(state, ownProps.post.channel_id) || {};

    return {
        enableEmojiPicker,
        enablePostUsernameOverride,
        isEmbedVisible: isEmbedVisible(state, ownProps.post.id),
        isReadOnly: isChannelReadOnlyById(state, ownProps.post.channel_id),
        teamId,
        pluginPostTypes: state.plugins.postTypes,
        channelIsArchived: channel.delete_at !== 0,
        channelType: channel.type,
        channelDisplayName: channel.display_name,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addReaction,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RhsRootPost);
