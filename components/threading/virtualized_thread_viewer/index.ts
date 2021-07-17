// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {get, getBool, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {getHighlightedPostId} from 'selectors/rhs';
import {makePrepareReplyIdsForThreadViewer, makeGetThreadLastViewedAt} from 'selectors/views/threads';

import {Preferences} from 'utils/constants';

import {GlobalState} from 'types/store';

import ThreadViewerVirtualized, {OwnProps} from './virtualized_thread_viewer';

function makeMapStateToProps() {
    const getRepliesListWithSeparators = makePrepareReplyIdsForThreadViewer();
    const getThreadLastViewedAt = makeGetThreadLastViewedAt();

    return (state: GlobalState, ownProps: OwnProps) => {
        const collapsedThreads = isCollapsedThreadsEnabled(state);
        const {postIds, useRelativeTimestamp, selected, openTime, channel} = ownProps;

        const currentUserId = getCurrentUserId(state);
        const lastViewedAt = getThreadLastViewedAt(state, selected.id);
        const directTeammate = getDirectTeammate(state, channel.id);
        const highlightedPostId = getHighlightedPostId(state);

        const lastPost = getPost(state, postIds[0]);

        const replyListIds = getRepliesListWithSeparators(state, {
            postIds,
            showDate: !useRelativeTimestamp,
            lastViewedAt,
            collapsedThreads,
            openTime,
        });

        const previewCollapsed = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT);
        const previewEnabled = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.LINK_PREVIEW_DISPLAY, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT === 'true');

        return {
            currentUserId,
            directTeammate,
            highlightedPostId,
            lastPost,
            previewCollapsed,
            previewEnabled,
            replyListIds,
            teamId: channel.team_id,
        };
    };
}

export default connect(makeMapStateToProps)(ThreadViewerVirtualized);
