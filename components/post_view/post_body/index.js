// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {isCurrentChannelReadOnly, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import PostBody from './post_body.jsx';

function mapStateToProps(state, ownProps) {
    let parentPost;
    if (ownProps.post.root_id) {
        parentPost = getPost(state, ownProps.post.root_id);
    }

    const currentChannel = getCurrentChannel(state);
    const channelIsArchived = currentChannel.delete_at !== 0;

    return {
        parentPost,
        pluginPostTypes: state.plugins.postTypes,
        isReadOnly: isCurrentChannelReadOnly(state) || channelIsArchived,
    };
}

export default connect(mapStateToProps)(PostBody);
