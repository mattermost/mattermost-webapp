// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {
    getPost,
} from 'mattermost-redux/selectors/entities/posts';

import TimeFormatInText from './time_format_in_text'

function mapStateToProps(state, ownProps) {
    const postUserId = getPost(state, ownProps.postId).user_id
    const postUserTimeZone = getUser(state, postUserId).timezone
    const isSelfPost = getCurrentUser(state).id === postUserId

    return {
        userTimeZone: getCurrentUser(state).timezone,
        postUserTimeZone,
        isSelfPost
    };
}

export default connect(mapStateToProps)(TimeFormatInText);
