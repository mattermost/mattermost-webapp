// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo, memo} from 'react';

import * as PostListUtils from 'mattermost-redux/utils/post_list';
import {Post} from 'mattermost-redux/types/posts';

import DateSeparator from 'components/post_view/date_separator';
import NewMessageSeparator from 'components/post_view/new_message_separator/new_message_separator';

import RootPost from './root_post';
import Reply from './reply';

type Props = {
    a11Index: number;
    currentUserId: string;
    isFirstPost: boolean;
    isLastPost: boolean;
    listId: string;
    onCardClick: (post: Post) => void;
    onCardClickPost: (post: Post) => void;
    previewCollapsed: string;
    previewEnabled: boolean;
    previousPostId: string;
    teamId: string;
    timestampProps?: any;
};

function ThreadViewerRow({
    a11Index,
    currentUserId,
    isFirstPost,
    isLastPost,
    listId,
    onCardClick,
    onCardClickPost,
    previewCollapsed,
    previewEnabled,
    previousPostId,
    teamId,
    timestampProps,
}: Props) {
    const [isDateLine, isStartOfNewMessages] = useMemo(() => [
        PostListUtils.isDateLine(listId),
        PostListUtils.isStartOfNewMessages(listId),
    ], [listId]);

    switch (true) {
    case isDateLine: {
        const date = PostListUtils.getDateForDateLine(listId);
        return (
            <DateSeparator
                key={date}
                date={date}
            />
        );
    }

    case isStartOfNewMessages:
        return <NewMessageSeparator separatorId={listId}/>;

    case isFirstPost:
        return (
            <RootPost
                a11Index={a11Index}
                currentUserId={currentUserId}
                id={listId}
                isLastPost={isLastPost}
                onCardClick={onCardClick}
                previewCollapsed={previewCollapsed}
                previewEnabled={previewEnabled}
                teamId={teamId}
                timestampProps={timestampProps}
            />
        );
    default:
        return (
            <Reply
                a11Index={a11Index}
                currentUserId={currentUserId}
                id={listId}
                isLastPost={isLastPost}
                onCardClick={onCardClickPost}
                previewCollapsed={previewCollapsed}
                previewEnabled={previewEnabled}
                previousPostId={previousPostId}
                teamId={teamId}
                timestampProps={timestampProps}
            />
        );
    }
}

export default memo(ThreadViewerRow);
