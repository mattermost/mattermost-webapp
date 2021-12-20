// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';

import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {getCurrentTeamId, getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';

import {setThreadFollow} from 'mattermost-redux/actions/threads';
import {getThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store';

import {
    setRhsExpanded,
    showMentions,
    showSearchResults,
    showFlaggedPosts,
    showPinnedPosts,
    showChannelFiles,
    closeRightHandSide,
    toggleRhsExpanded,
} from 'actions/views/rhs';
import {getIsRhsExpanded} from 'selectors/rhs';
import {getIsMobileView} from 'selectors/views/browser';

import {allAtMentions} from 'utils/text_formatting';
import {matchUserMentionTriggersWithMessageMentions} from 'utils/post_utils';

import RhsHeaderPost from './rhs_header_post';

type OwnProps = Pick<ComponentProps<typeof RhsHeaderPost>, 'rootPostId'>

function mapStateToProps(state: GlobalState, {rootPostId}: OwnProps) {
    let isFollowingThread = false;

    const collapsedThreads = isCollapsedThreadsEnabled(state);
    const root = getPost(state, rootPostId);

    if (root && collapsedThreads) {
        const thread = getThreadOrSynthetic(state, root);
        isFollowingThread = thread.is_following;

        if (isFollowingThread === null && thread.reply_count === 0) {
            const currentUserMentionKeys = getCurrentUserMentionKeys(state);
            const rootMessageMentionKeys = allAtMentions(root.message);

            isFollowingThread = matchUserMentionTriggersWithMessageMentions(currentUserMentionKeys, rootMessageMentionKeys);
        }
    }

    return {
        isExpanded: getIsRhsExpanded(state),
        isMobileView: getIsMobileView(state),
        relativeTeamUrl: getCurrentRelativeTeamUrl(state),
        currentTeamId: getCurrentTeamId(state),
        currentUserId: getCurrentUserId(state),
        isCollapsedThreadsEnabled: collapsedThreads,
        isFollowingThread,
    };
}

const actions = {
    setRhsExpanded,
    showSearchResults,
    showMentions,
    showFlaggedPosts,
    showPinnedPosts,
    showChannelFiles,
    closeRightHandSide,
    toggleRhsExpanded,
    setThreadFollow,
};

export default connect(mapStateToProps, actions)(RhsHeaderPost);
