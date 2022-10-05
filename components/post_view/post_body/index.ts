// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';
import {Post} from '@mattermost/types/posts';

import PostBody from './post_body';

interface OwnProps {
    post: Post;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    let parentPost;
    let parentPostUser;
    if (ownProps.post.root_id) {
        parentPost = getPost(state, ownProps.post.root_id);
        parentPostUser = parentPost ? getUser(state, parentPost.user_id) : null;
    }

    const channel = makeGetChannel()(state, {id: ownProps.post.channel_id});
    const isCRTEnabled = isCollapsedThreadsEnabled(state);
    const currentTeam = getCurrentTeam(state);

    return {
        parentPost,
        parentPostUser,
        pluginPostTypes: state.plugins.postTypes,
        isCRTEnabled,
        currentTeam,
        channel,
    };
}

export default connect(mapStateToProps)(PostBody);
