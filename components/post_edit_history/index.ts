// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';

import {getSelectedPostId} from 'selectors/rhs';
import {getPostEditHistory} from 'selectors/posts';

import PostEditHistory from './post_edit_history';

function mapStateToProps(state: GlobalState) {
    const selectedPostId = getSelectedPostId(state) || '';
    const post = getPost(state, selectedPostId);
    const postEditHistory = getPostEditHistory(state);

    return {
        channelDisplayName: getCurrentChannel(state).display_name,
        originalPost: post,
        postEditHistory,
    };
}

export default connect(mapStateToProps)(PostEditHistory);
