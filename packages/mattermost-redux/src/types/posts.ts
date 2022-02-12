// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CustomEmoji} from './emojis';
import {FileInfo} from './files';
import {Reaction} from './reactions';
import {
    RelationOneToOne,
    RelationOneToMany,
    IDMappedObjects,
} from './utilities';

export type PostType = 'system_add_remove' |
'system_add_to_channel' |
'system_add_to_team' |
'system_channel_deleted' |
'system_channel_restored' |
'system_displayname_change' |
'system_convert_channel' |
'system_ephemeral' |
'system_header_change' |
'system_join_channel' |
'system_join_leave' |
'system_leave_channel' |
'system_purpose_change' |
'system_remove_from_channel' |
'system_combined_user_activity';

export type PostEmbedType = 'image' | 'link' | 'message_attachment' | 'opengraph' | 'permalink';

export type PostEmbed = {
    type: PostEmbedType;
    url: string;
    data?: OpenGraphMetadata | PostPreviewMetadata;
};

export type PostImage = {
    format: string;
    frameCount: number;
    height: number;
    width: number;
};

export type PostMetadata = {
    embeds: PostEmbed[];
    emojis: CustomEmoji[];
    files: FileInfo[];
    images: Record<string, PostImage>;
    reactions: Reaction[];
};

export type Post = {
    id: string;
    create_at: number;
    update_at: number;
    edit_at: number;
    delete_at: number;
    is_pinned: boolean;
    user_id: string;
    channel_id: string;
    root_id: string;
    original_id: string;
    message: string;
    type: PostType;
    props: Record<string, any>;
    hashtags: string;
    pending_post_id: string;
    reply_count: number;
    file_ids?: string[];
    metadata: PostMetadata;
    failed?: boolean;
    user_activity_posts?: Post[];
    state?: 'DELETED';
    filenames?: string[];
    last_reply_at?: number;
    participants?: any; //Array<UserProfile | UserProfile['id']>;
    message_source?: string;
    is_following?: boolean;
    exists?: boolean;
};

export type UserActivityPost = Post & {
    system_post_ids: string[];
    user_activity_posts: Post[];
}

export type PostList = {
    order: Array<Post['id']>;
    posts: Map<string, Post>;
    next_post_id: string;
    prev_post_id: string;
};

export type PostSearchResults = PostList & {
    matches: RelationOneToOne<Post, string[]>;
};

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

export type PostOrderBlock = {
    order: string[];
    recent?: boolean;
    oldest?: boolean;
};

export type MessageHistory = {
    messages: string[];
    index: {
        post: number;
        comment: number;
    };
};

export type PostsState = {
    posts: IDMappedObjects<Post>;
    postsReplies: {[x in Post['id']]: number};
    postsInChannel: Record<string, PostOrderBlock[]>;
    postsInThread: RelationOneToMany<Post, Post>;
    reactions: RelationOneToOne<Post, Record<string, Reaction>>;
    openGraph: RelationOneToOne<Post, Record<string, OpenGraphMetadata>>;
    pendingPostIds: string[];
    selectedPostId: string;
    currentFocusedPostId: string;
    messagesHistory: MessageHistory;
    expandedURLs: Record<string, string>;
};

export declare type OpenGraphMetadataImage = {
    secure_url?: string;
    url: string;
    height?: number;
    width?: number;
}

export declare type OpenGraphMetadata = {
    type?: string;
    title?: string;
    description?: string;
    site_name?: string;
    url?: string;
    images: OpenGraphMetadataImage[];
};

export declare type PostPreviewMetadata = {
    post_id: string;
    post?: Post;
    channel_display_name: string;
    team_name: string;
};
