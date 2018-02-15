// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {get, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {makeGetGlobalItem} from 'selectors/storage';
import {Preferences, StoragePrefixes} from 'utils/constants.jsx';

import PostBody from './post_body.jsx';

const mapStateToProps = (state, ownProps) => {
    let parentPost;
    let parentPostUser;
    const previewCollapsed = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT);
    const isEmbedVisible = makeGetGlobalItem(StoragePrefixes.EMBED_VISIBLE + ownProps.post.id, previewCollapsed.startsWith('false'))(state);
    if (ownProps.post.root_id) {
        parentPost = getPost(state, ownProps.post.root_id);
        parentPostUser = parentPost ? getUser(state, parentPost.user_id) : null;
    }

    return {
        parentPost,
        parentPostUser,
        pluginPostTypes: state.plugins.postTypes,
        previewCollapsed,
        previewEnabled: getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.LINK_PREVIEW_DISPLAY, true),
        isEmbedVisible
    };
};

export default connect(mapStateToProps)(PostBody);
