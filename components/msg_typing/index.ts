// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {makeGetUsersTypingByChannelAndPost} from 'mattermost-redux/selectors/entities/typing';

import {GlobalState} from 'types/store';

import {userStartedTyping, userStoppedTyping} from './actions';
import MsgTyping from './msg_typing';

type OwnProps = {
    channelId: string;
    postId: string;
};

function makeMapStateToProps() {
    const getUsersTypingByChannelAndPost = makeGetUsersTypingByChannelAndPost();

    return (state: GlobalState, ownProps: OwnProps) => {
        return {
            typingUsers: getUsersTypingByChannelAndPost(state, {channelId: ownProps.channelId, postId: ownProps.postId}),
        };
    };
}

const mapDispatchToProps = {
    userStartedTyping,
    userStoppedTyping,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(MsgTyping);
