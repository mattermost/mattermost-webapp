// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@mattermost/types/posts';
import {PostTypes} from 'utils/constants';

export type UserActivityPost = Post & {
    system_post_ids: string[];
    user_activity_posts: Post[];
}

export type PostWithFormatData = Post & {
    isFirstReply: boolean;
    isLastReply: boolean;
    previousPostIsComment: boolean;
    commentedOnPost?: Post;
    consecutivePostByUser: boolean;
    replyCount: number;
    isCommentMention: boolean;
    highlight: boolean;
};

// New post is a post that is pending being
// saved on the server
export interface NewPost {
    id: Post['id'];
    user_id: Post['user_id'];
    channel_id: Post['channel_id'];
    message: Post['message'];
    type: typeof PostTypes[keyof typeof PostTypes];
    create_at: number;
    update_at: number;
    root_id: string;
    props: {
        username?: string;
        addedUsername?: string;
        addedUserId?: string;
    };
}
