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

import {UserThread, UserThreadSynthetic} from 'mattermost-redux/types/threads';
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

import {allAtMentions} from '../../utils/text_formatting';

import {matchUserMentionTriggersWithMessageMentions} from '../../utils/post_utils';

import RhsHeaderPost from './rhs_header_post';

type UserThreadOrSythetic = UserThread | UserThreadSynthetic;
type OwnProps = Pick<ComponentProps<typeof RhsHeaderPost>, 'rootPostId'>

function mapStateToProps(state: GlobalState, {rootPostId}: OwnProps) {
    const root = getPost(state, rootPostId);
    const currentUserMentionKeys = getCurrentUserMentionKeys(state);

    let isMentionedInRootPost = false;
    let thread = {} as UserThreadOrSythetic;
    if (root) {
        const rootMessageMentionKeys = allAtMentions(root.message);
        thread = getThreadOrSynthetic(state, root);
        isMentionedInRootPost = thread.reply_count === 0 &&
            matchUserMentionTriggersWithMessageMentions(currentUserMentionKeys, rootMessageMentionKeys);
    }

    return {
        isExpanded: getIsRhsExpanded(state),
        relativeTeamUrl: getCurrentRelativeTeamUrl(state),
        currentTeamId: getCurrentTeamId(state),
        currentUserId: getCurrentUserId(state),
        isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
        isFollowingThread: isCollapsedThreadsEnabled(state) && root && thread.is_following,
        isMentionedInRootPost,
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
