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
    selectPostCardFromRightHandSideSearch,
    setRhsExpanded,
} from 'actions/views/rhs';

import {makeCreateAriaLabelForPost, makeGetReplyCount} from 'utils/post_utils.jsx';
import {getDirectTeammate, getDisplayNameByUser} from 'utils/utils.jsx';

import SearchResultsItem from './search_results_item.jsx';

function mapStateToProps() {
    const getReplyCount = makeGetReplyCount();
    const createAriaLabelForPost = makeCreateAriaLabelForPost();
    const getCommentCountForPost = makeGetCommentCountForPost();

    return (state, ownProps) => {
        const config = getConfig(state);
        const preferences = getMyPreferences(state);
        const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
        const {post} = ownProps;
        const user = getUser(state, post.user_id);
        const channel = getChannel(state, post.channel_id) || {delete_at: 0};
        const directTeammate = getDirectTeammate(state, channel.id);

        return {
            createAriaLabel: createAriaLabelForPost(state, post),
            channelId: channel.id,
            channelName: channel.display_name,
            channelType: channel.type,
            channelIsArchived: channel.delete_at !== 0,
            currentTeamName: getCurrentTeam(state).name,
            commentCountForPost: getCommentCountForPost(state, {post}),
            enablePostUsernameOverride,
            isFlagged: isPostFlagged(post.id, preferences),
            isBot: user ? user.is_bot : false,
            directTeammate,
            displayName: getDisplayNameByUser(state, directTeammate),
            replyCount: getReplyCount(state, post),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
            selectPost: selectPostFromRightHandSideSearch,
            selectPostCard: selectPostCardFromRightHandSideSearch,
            setRhsExpanded,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsItem);
