// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'mattermost-redux/actions/posts';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {makeGetReactionsForPost} from 'mattermost-redux/selectors/entities/posts';

import ReactionList from './reaction_list.jsx';

const makeMapStateToProps = () => {
    const getReactionsForPost = makeGetReactionsForPost();

    return (state, ownProps) => {
        return {
            reactions: getReactionsForPost(state, ownProps.post.id),
            emojis: getCustomEmojisByName(state)
        };
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getReactionsForPost: Actions.getReactionsForPost,
        addReaction: Actions.addReaction
    }, dispatch)
});

export default connect(makeMapStateToProps, mapDispatchToProps)(ReactionList);
