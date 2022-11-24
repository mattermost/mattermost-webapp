// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {Post} from '@mattermost/types/posts';

import PostComponent from 'components/post';
import {Props as TimestampProps} from 'components/timestamp/timestamp';
import {Locations} from 'utils/constants';

type Props = {
    a11yIndex: number;
    currentUserId: string;
    isLastPost: boolean;
    onCardClick: (post: Post) => void;
    post: Post;
    previousPostId: string;
    teamId: string;
    timestampProps?: Partial<TimestampProps>;
    id?: Post['id'];
}

function Reply({
    a11yIndex,
    isLastPost,
    onCardClick,
    post,
    previousPostId,
    teamId,
    timestampProps,
}: Props) {
    return (
        <PostComponent
            a11yIndex={a11yIndex}
            handleCardClick={onCardClick}
            isLastPost={isLastPost}
            post={post}
            previousPostId={previousPostId}
            teamId={teamId}
            timestampProps={timestampProps}
            location={Locations.RHS_COMMENT}
        />
    );
}

export default memo(Reply);
