// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {makeGetUsersTypingByChannelAndPost} from 'mattermost-redux/selectors/entities/typing';

import MsgTyping from './msg_typing.jsx';

function makeMapStateToProps() {
    const getUsersTypingByChannelAndPost = makeGetUsersTypingByChannelAndPost();

    return function mapStateToProps(state, ownProps) {
        const typingUsers = getUsersTypingByChannelAndPost(state, {channelId: ownProps.channelId, postId: ownProps.postId});

        return {
            typingUsers,
        };
    };
}

export default connect(makeMapStateToProps)(MsgTyping);
