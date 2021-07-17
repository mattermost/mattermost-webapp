// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {Post} from 'mattermost-redux/types/posts';

import RhsRootPost from 'components/rhs_root_post';

export type OwnProps = {
    a11Index: number;
    id: string;
    isLastPost: boolean;
    timestampProps: any;
    onCardClick: (post: Post) => void;
    previewEnabled: boolean;
    previewCollapsed: string;
    currentUserId: string;
    teamId: string;
}

type Props = OwnProps & {
    post: Post;
};

function RootPost({
    a11Index,
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
            a11Index={a11Index}
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
