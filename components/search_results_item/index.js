// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {isPostFlagged} from 'mattermost-redux/utils/post_utils';

import {
    closeRightHandSide,
    selectPostFromRightHandSideSearch,
    setRhsExpanded,
} from 'actions/views/rhs';

import SearchResultsItem from './search_results_item.jsx';

function mapStateToProps() {
    const getCommentCountForPost = makeGetCommentCountForPost();

    return (state, ownProps) => {
        const config = getConfig(state);
        const preferences = getMyPreferences(state);
        const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
        const {post} = ownProps;
        const user = getUser(state, post.user_id);

        return {
            channel: getChannel(state, post.channel_id),
            currentTeamName: getCurrentTeam(state).name,
            commentCountForPost: getCommentCountForPost(state, {post}),
            enablePostUsernameOverride,
            isFlagged: isPostFlagged(post.id, preferences),
            isBot: user ? user.is_bot : false,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
            selectPost: selectPostFromRightHandSideSearch,
            setRhsExpanded,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsItem);
