// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment';

import {createSelector} from 'reselect';

import {makeGetPostsForIds} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getThreads} from 'mattermost-redux/selectors/entities/threads';
import {isTimezoneEnabled} from 'mattermost-redux/selectors/entities/timezone';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';

import {Team} from 'mattermost-redux/types/teams';
import {UserThread} from 'mattermost-redux/types/threads';
import {$ID} from 'mattermost-redux/types/utilities';
import {Post} from 'mattermost-redux/types/posts';

import {DATE_LINE, makeCombineUserActivityPosts, START_OF_NEW_MESSAGES, CREATE_COMMENT} from 'mattermost-redux/utils/post_list';
import {createIdsSelector} from 'mattermost-redux/utils/helpers';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';

import {GlobalState} from 'types/store';
import {ViewsState} from 'types/store/views';
import {getIsRhsOpen, getSelectedPostId} from 'selectors/rhs';
import {isFromWebhook} from 'utils/post_utils';

interface PostFilterOptions {
    postIds: Array<$ID<Post>>;
    showDate: boolean;
    lastViewedAt?: number;
}

export function getSelectedThreadIdInTeam(state: GlobalState): ViewsState['threads']['selectedThreadIdInTeam'] {
    return state.views.threads.selectedThreadIdInTeam;
}

export const getSelectedThreadIdInCurrentTeam: (state: GlobalState) => ViewsState['threads']['selectedThreadIdInTeam'][$ID<Team>] = createSelector(
    'getSelectedThreadIdInCurrentTeam',
    getCurrentTeamId,
    getSelectedThreadIdInTeam,
    (
        currentTeamId,
        selectedThreadIdInTeam,
    ) => {
        return selectedThreadIdInTeam?.[currentTeamId] ?? null;
    },
);

export const getSelectedThreadInCurrentTeam: (state: GlobalState) => UserThread | null = createSelector(
    'getSelectedThreadInCurrentTeam',
    getCurrentTeamId,
    getSelectedThreadIdInTeam,
    getThreads,
    (
        currentTeamId,
        selectedThreadIdInTeam,
        threads,
    ) => {
        const threadId = selectedThreadIdInTeam?.[currentTeamId];
        return threadId ? threads[threadId] : null;
    },
);

export function makeGetThreadLastViewedAt(): (state: GlobalState, threadId: $ID<Post>) => number {
    return createSelector(
        'makeGetThreadLastViewedAt',
        (state: GlobalState, threadId: $ID<Post>) => state.views.threads.lastViewedAt[threadId],
        getThreads,
        (_state, threadId) => threadId,
        (lastViewedAt, threads, threadId) => {
            if (typeof lastViewedAt === 'number') {
                return lastViewedAt;
            }

            return threads[threadId]?.last_viewed_at;
        },
    );
}

export const isThreadOpen = (state: GlobalState, threadId: $ID<UserThread>): boolean => {
    return (
        threadId === getSelectedThreadIdInCurrentTeam(state) ||
        (getIsRhsOpen(state) && threadId === getSelectedPostId(state))
    );
};

export const isThreadManuallyUnread = (state: GlobalState, threadId: $ID<UserThread>): boolean => {
    return state.views.threads.manuallyUnread[threadId] || false;
};

// Returns a selector that, given the state and an object containing an array of postIds and an optional
// timestamp of when the channel was last read, returns a memoized array of postIds interspersed with
// day indicators, an optional new message indicator and create comment.
export function makeFilterRepliesAndAddSeparators() {
    const getPostsForIds = makeGetPostsForIds();

    return createIdsSelector(
        'makeFilterPostsAndAddSeparators',
        (state: GlobalState, {postIds}: PostFilterOptions) => getPostsForIds(state, postIds),
        (_state: GlobalState, {lastViewedAt}: PostFilterOptions) => lastViewedAt,
        (_state: GlobalState, {showDate}: PostFilterOptions) => showDate,
        getCurrentUser,
        isTimezoneEnabled,
        (posts, lastViewedAt, showDate, currentUser, timeZoneEnabled) => {
            if (posts.length === 0 || !currentUser) {
                return [];
            }

            const out: string[] = [];
            let lastDate;
            let addedNewMessagesIndicator = false;

            // Iterating through the posts from oldest to newest
            for (let i = posts.length - 1; i >= 0; i--) {
                const post = posts[i];

                if (!post) {
                    continue;
                }

                if (showDate) {
                    // Push on a date header if the last post was on a different day than the current one
                    const postDate = new Date(post.create_at);
                    if (timeZoneEnabled) {
                        const currentOffset = postDate.getTimezoneOffset() * 60 * 1000;
                        const timezone = getUserCurrentTimezone(currentUser.timezone);
                        if (timezone) {
                            const zone = moment.tz.zone(timezone);
                            if (zone) {
                                const timezoneOffset = zone.utcOffset(post.create_at) * 60 * 1000;
                                postDate.setTime(post.create_at + (currentOffset - timezoneOffset));
                            }
                        }
                    }

                    if ((!lastDate || lastDate.toDateString() !== postDate.toDateString())) {
                        out.push(DATE_LINE + postDate.getTime());
                        lastDate = postDate;
                    }
                }

                if (
                    typeof lastViewedAt === 'number' &&
                    post.create_at >= lastViewedAt &&
                    (i < posts.length - 1) &&
                    (post.user_id !== currentUser.id || isFromWebhook(post)) &&
                    !addedNewMessagesIndicator
                ) {
                    out.push(START_OF_NEW_MESSAGES);
                    addedNewMessagesIndicator = true;
                }

                out.push(post.id);
            }

            out.push(CREATE_COMMENT);

            // Flip it back to newest to oldest
            return out.reverse();
        },
    );
}

export function makePrepareReplyIdsForThreadViewer() {
    const filterRepliesAndAddSeparators = makeFilterRepliesAndAddSeparators();
    const combineUserActivityPosts = makeCombineUserActivityPosts();
    return (state: GlobalState, options: PostFilterOptions) => {
        const postIds = filterRepliesAndAddSeparators(state, options);
        return combineUserActivityPosts(state, postIds);
    };
}

