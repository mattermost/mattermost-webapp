// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';

import {useDispatch} from 'react-redux';

import {removePost} from 'mattermost-redux/actions/posts';

import RhsComment from 'components/rhs_comment';
import {Props as TimestampProps} from 'components/timestamp/timestamp';

import {Post} from '@mattermost/types/posts';

type Props = {
    a11yIndex: number;
    currentUserId: string;
    isLastPost: boolean;
    onCardClick: (post: Post) => void;
    post: Post;
    previousPostId: string;
    teamId: string;
    timestampProps?: Partial<TimestampProps>;
}

function Reply({
    a11yIndex,
    currentUserId,
    isLastPost,
    onCardClick,
    post,
    previousPostId,
    teamId,
    timestampProps,
}: Props) {
    const dispatch = useDispatch();

    const handleRemovePost = useCallback((post: Post) => {
        dispatch(removePost(post));
    }, []);

    return (
        <RhsComment
            a11yIndex={a11yIndex}
            currentUserId={currentUserId}
            handleCardClick={onCardClick}
            isLastPost={isLastPost}
            post={post}
            previousPostId={previousPostId}
            removePost={handleRemovePost}
            teamId={teamId}
            timestampProps={timestampProps}
        />
    );
}

export default memo(Reply);
