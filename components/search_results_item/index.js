// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';

import {closeRightHandSide} from 'actions/views/rhs';

import SearchResultsItem from './search_results_item.jsx';

const mapStateToProps = (state, ownProps) => {
    const getCommentCountForPost = makeGetCommentCountForPost();
    return {
        currentTeamName: getCurrentTeam(state).name,
        commentCountForPost: getCommentCountForPost(state, {post: ownProps.post})
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeRightHandSide
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsItem);
