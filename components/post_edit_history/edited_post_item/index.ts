// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getSelectedPostId} from 'selectors/rhs';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {GlobalState} from 'types/store';

import EditedPostItem from './edited_post_item';

function mapStateToProps(state: GlobalState) {
    const selectedPostId = getSelectedPostId(state) || '';
    const post = getPost(state, selectedPostId);

    return {
        post,
    };
}

export default connect(mapStateToProps)(EditedPostItem);
