// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'mattermost-redux/actions/posts';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetReactionsForPost} from 'mattermost-redux/selectors/entities/posts';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import ReactionList from './reaction_list.jsx';

function makeMapStateToProps() {
    const getReactionsForPost = makeGetReactionsForPost();

    return function mapStateToProps(state, ownProps) {
        const config = getConfig(state);
        const enableEmojiPicker = config.EnableEmojiPicker === 'true' && !ownProps.isReadOnly;

        const channel = getChannel(state, ownProps.post.channel_id) || {};
        const teamId = channel.team_id;

        return {
            teamId,
            reactions: getReactionsForPost(state, ownProps.post.id),
            emojis: getCustomEmojisByName(state),
            enableEmojiPicker,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getReactionsForPost: Actions.getReactionsForPost,
            addReaction: Actions.addReaction,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ReactionList);
