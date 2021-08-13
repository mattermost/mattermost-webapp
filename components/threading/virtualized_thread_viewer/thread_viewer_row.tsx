// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import * as PostListUtils from 'mattermost-redux/utils/post_list';
import {Post} from 'mattermost-redux/types/posts';

import DateSeparator from 'components/post_view/date_separator';
import NewMessageSeparator from 'components/post_view/new_message_separator/new_message_separator';
import {Props as TimestampProps} from 'components/timestamp/timestamp';

import RootPost from './root_post';
import Reply from './reply';

type Props = {
    a11yIndex: number;
    currentUserId: string;
    isRootPost: boolean;
    isLastPost: boolean;
    listId: string;
    onCardClick: (post: Post) => void;
    onCardClickPost: (post: Post) => void;
    previousPostId: string;
    teamId: string;
    timestampProps?: Partial<TimestampProps>;
};

function ThreadViewerRow({
    a11yIndex,
    currentUserId,
    isRootPost,
    isLastPost,
    listId,
    onCardClick,
    onCardClickPost,
    previousPostId,
    teamId,
    timestampProps,
}: Props) {
    switch (true) {
    case PostListUtils.isDateLine(listId): {
        const date = PostListUtils.getDateForDateLine(listId);
        return (
            <DateSeparator
                key={date}
                date={date}
            />
        );
    }

    case PostListUtils.isStartOfNewMessages(listId):
        return <NewMessageSeparator separatorId={listId}/>;

    case isRootPost:
        return (
            <RootPost
                currentUserId={currentUserId}
                id={listId}
                isLastPost={isLastPost}
                onCardClick={onCardClick}
                teamId={teamId}
                timestampProps={timestampProps}
            />
        );
    default:
        return (
            <Reply
                a11yIndex={a11yIndex}
                currentUserId={currentUserId}
                id={listId}
                isLastPost={isLastPost}
                onCardClick={onCardClickPost}
                previousPostId={previousPostId}
                teamId={teamId}
                timestampProps={timestampProps}
            />
        );
    }
}

export default memo(ThreadViewerRow);
