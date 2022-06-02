// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@mattermost/types/posts';

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
