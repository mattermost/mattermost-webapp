// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';

import {getInt, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

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
import {CrtThreadPaneSteps, Preferences} from 'utils/constants';

import {allAtMentions} from '../../utils/text_formatting';

import {matchUserMentionTriggersWithMessageMentions} from '../../utils/post_utils';

import RhsHeaderPost from './rhs_header_post';

type OwnProps = Pick<ComponentProps<typeof RhsHeaderPost>, 'rootPostId'>

function mapStateToProps(state: GlobalState, {rootPostId}: OwnProps) {
    const root = getPost(state, rootPostId);
    const currentUserMentionKeys = getCurrentUserMentionKeys(state);
    const rootMessageMentionKeys = allAtMentions(root.message);
    const thread = getThreadOrSynthetic(state, root);
    const isMentionedInRootPost = thread.reply_count === 0 &&
        matchUserMentionTriggersWithMessageMentions(currentUserMentionKeys, rootMessageMentionKeys);
    const currentUserId = getCurrentUserId(state) as string;
    const tipStep = getInt(state, Preferences.CRT_THREAD_PANE_STEP, currentUserId);
    const showThreadsTutorialTip = tipStep === CrtThreadPaneSteps.THREADS_PANE_POPOVER;
    return {
        isExpanded: getIsRhsExpanded(state),
        relativeTeamUrl: getCurrentRelativeTeamUrl(state),
        currentTeamId: getCurrentTeamId(state),
        currentUserId,
        isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
        isFollowingThread: isCollapsedThreadsEnabled(state) && root && thread.is_following,
        isMentionedInRootPost,
        showThreadsTutorialTip,
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
