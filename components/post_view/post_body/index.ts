// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {
    isCurrentChannelReadOnly,
    getCurrentChannel,
} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {Post} from 'mattermost-redux/types/posts';
import {GlobalState} from 'mattermost-redux/types/store';

import PostBody from './post_body';

type Props = {
    post: Post;
};
function mapStateToProps(state: GlobalState, ownProps: Props) {
    let parentPost;
    let parentPostUser;
    if (ownProps.post.root_id) {
        parentPost = getPost(state, ownProps.post.root_id);
        parentPostUser = parentPost ? getUser(state, parentPost.user_id) : undefined;
    }

    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    const currentChannel = getCurrentChannel(state);
    const channelIsArchived = currentChannel.delete_at !== 0;

    return {
        parentPost,
        parentPostUser,
        pluginPostTypes: state.plugins.postTypes,
        enablePostUsernameOverride,
        isReadOnly: isCurrentChannelReadOnly(state) || channelIsArchived,
    };
}

export default connect(mapStateToProps)(PostBody);
