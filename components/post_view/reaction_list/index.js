// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getReactionsForPosts} from 'mattermost-redux/selectors/entities/posts';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {addReaction} from 'actions/post_actions.jsx';
import {scrollPostList} from 'actions/views/channel';

import ReactionList from './reaction_list.jsx';

function makeMapStateToProps(state, ownProps) {
    // const getReactionsForPost = makeGetReactionsForPost();

    // return function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const enableEmojiPicker = config.EnableEmojiPicker === 'true' && !ownProps.isReadOnly;

    const channel = getChannel(state, ownProps.post.channel_id) || {};
    const teamId = channel.team_id;

    // console.log('ReactionList::mapStateToProps', ownProps.post.id,

    return {
        teamId,
        reactions: getReactionsForPosts(state)[ownProps.post.id],
        enableEmojiPicker,
    };

    // };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addReaction,
            scrollPostList,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ReactionList);
