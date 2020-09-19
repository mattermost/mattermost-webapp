// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {makeGetReactionsForPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {addReaction, removeReaction} from 'actions/post_actions.jsx';

import PostReaction from './post_reaction';

function mapStateToProps(state, ownProps) {
    const getReactionsForPost = makeGetReactionsForPost();
    const currentUserId = getCurrentUserId(state);

    return {
        reactions: Object.values(getReactionsForPost(state, ownProps.postId) || {}),
        currentUserId,
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

export default connect(mapStateToProps, mapDispatchToProps)(PostReaction);
