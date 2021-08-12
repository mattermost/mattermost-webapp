// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getChannel, getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GenericAction} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';

import {isPostFlagged} from 'mattermost-redux/utils/post_utils';

import {
    closeRightHandSide,
    selectPostFromRightHandSideSearch,
    selectPostCardFromRightHandSideSearch,
    setRhsExpanded,
} from 'actions/views/rhs';

import {GlobalState} from 'types/store';

import {getDisplayNameByUser} from 'utils/utils.jsx';

import SearchResultsItem from './search_results_item.jsx';

interface OwnProps {
    post: Post;
}

function mapStateToProps() {
    const getReplyCount = makeGetCommentCountForPost();

    return (state: GlobalState, ownProps: OwnProps) => {
        const {post} = ownProps;
        const config = getConfig(state);
        const preferences = getMyPreferences(state);
        const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
        const user = getUser(state, post.user_id);
        const channel = getChannel(state, post.channel_id) || {delete_at: 0};
        const directTeammate = getDirectTeammate(state, channel.id);

        return {
            currentTeamName: getCurrentTeam(state).name,
            channelId: channel.id,
            channelName: channel.display_name,
            channelType: channel.type,
            channelIsArchived: channel.delete_at !== 0,
            enablePostUsernameOverride,
            isFlagged: isPostFlagged(post.id, preferences),
            isBot: user ? user.is_bot : false,
            displayName: getDisplayNameByUser(state, directTeammate),
            replyCount: getReplyCount(state, post),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
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
