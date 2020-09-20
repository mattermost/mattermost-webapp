// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetReactionsForPost} from 'mattermost-redux/selectors/entities/posts';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {addReaction, removeReaction} from 'actions/post_actions.jsx';

import ReactionList from './reaction_list.jsx';

function makeMapStateToProps() {
    const getReactionsForPost = makeGetReactionsForPost();

    return function mapStateToProps(state, ownProps) {
        const config = getConfig(state);
        const enableEmojiPicker = config.EnableEmojiPicker === 'true' && !ownProps.isReadOnly;
        const currentUserId = getCurrentUserId(state);

        const channel = getChannel(state, ownProps.post.channel_id) || {};
        const teamId = channel.team_id;

        return {
            teamId,
            reactions: getReactionsForPost(state, ownProps.post.id),
            enableEmojiPicker,
            currentUserId,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addReaction,
            removeReaction,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps(), mapDispatchToProps)(ReactionList);
