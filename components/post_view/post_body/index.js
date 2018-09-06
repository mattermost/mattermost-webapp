// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {isCurrentChannelReadOnly, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {get, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {isEmbedVisible} from 'selectors/posts';
import {Preferences} from 'utils/constants.jsx';

import PostBody from './post_body.jsx';

function mapStateToProps(state, ownProps) {
    let parentPost;
    let parentPostUser;
    const previewCollapsed = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT);
    if (ownProps.post.root_id) {
        parentPost = getPost(state, ownProps.post.root_id);
        parentPostUser = parentPost ? getUser(state, parentPost.user_id) : null;
    }

    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    const currentChannel = getCurrentChannel(state);
    const channelIsArchived = currentChannel.delete_at !== 0;

    return {
        parentPost,
        parentPostUser,
        pluginPostTypes: state.plugins.postTypes,
        previewCollapsed,
        previewEnabled: getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.LINK_PREVIEW_DISPLAY, true),
        isEmbedVisible: isEmbedVisible(state, ownProps.post.id),
        enablePostUsernameOverride,
        isReadOnly: isCurrentChannelReadOnly(state) || channelIsArchived,
    };
}

export default connect(mapStateToProps)(PostBody);
