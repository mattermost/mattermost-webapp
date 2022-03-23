// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {Post} from 'mattermost-redux/types/posts';

import RhsRootPost from 'components/rhs_root_post';
import {Props as TimestampProps} from 'components/timestamp/timestamp';

type Props = {
    currentUserId: string;
    isLastPost: boolean;
    onCardClick: (post: Post) => void;
    post: Post;
    previewCollapsed: string;
    previewEnabled: boolean;
    teamId: string;
    timestampProps?: Partial<TimestampProps>;
}

function RootPost({
    currentUserId,
    isLastPost,
    onCardClick,
    post,
    previewCollapsed,
    previewEnabled,
    teamId,
    timestampProps,
}: Props) {
    return (
        <RhsRootPost
            commentCount={post.reply_count}
            currentUserId={currentUserId}
            handleCardClick={onCardClick}
            isLastPost={isLastPost}
            post={post}
            previewCollapsed={previewCollapsed}
            previewEnabled={previewEnabled}
            teamId={teamId}
            timestampProps={timestampProps}
        />
    );
}

export default memo(RootPost);
