// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getChannel, getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {makeGetCommentCountForPost} from 'mattermost-redux/selectors/entities/posts';
import {getMyPreferences, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam, getTeam, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
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

import {getRhsState} from 'selectors/rhs';
import {getIsMobileView} from 'selectors/views/browser';

import {GlobalState} from 'types/store';

import {getDisplayNameByUser} from 'utils/utils.jsx';

import {General} from 'mattermost-redux/constants';

import {RHSStates} from 'utils/constants.jsx';

import SearchResultsItem from './search_results_item.jsx';

interface OwnProps {
    post: Post;
}

// Exported for testing
export function mapStateToProps() {
    const getReplyCount = makeGetCommentCountForPost();

    return (state: GlobalState, ownProps: OwnProps) => {
        const {post} = ownProps;
        const config = getConfig(state);
        const preferences = getMyPreferences(state);
        const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
        const user = getUser(state, post.user_id);
        const channel = getChannel(state, post.channel_id) || {delete_at: 0};

        const currentTeam = getCurrentTeam(state);
        let teamName = currentTeam.name;
        let teamDisplayName = '';

        const memberships = getTeamMemberships(state);
        const isDMorGM = channel.type === General.DM_CHANNEL || channel.type === General.GM_CHANNEL;
        const rhsState = getRhsState(state);
        if (
            rhsState !== RHSStates.PIN && // Not show in pinned posts since they are all for the same channel
            !isDMorGM && // Not show for DM or GMs since they don't belong to a team
            memberships && Object.values(memberships).length > 1 // Not show if the user only belongs to one team
        ) {
            const team = getTeam(state, channel.team_id);
            teamDisplayName = team?.display_name;
            teamName = team?.name || currentTeam.name;
        }

        const canReply = isDMorGM || (channel.team_id === currentTeam.id);
        const directTeammate = getDirectTeammate(state, channel.id);

        return {
            teamDisplayName,
            teamName,
            channelId: channel.id,
            channelName: channel.display_name,
            channelType: channel.type,
            channelIsArchived: channel.delete_at !== 0,
            enablePostUsernameOverride,
            isFlagged: isPostFlagged(post.id, preferences),
            isBot: user ? user.is_bot : false,
            isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
            displayName: getDisplayNameByUser(state, directTeammate),
            replyCount: getReplyCount(state, post),
            canReply,
            isMobileView: getIsMobileView(state),
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
