// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CustomEmoji} from './emojis';
import {FileInfo} from './files';
import {Reaction} from './reactions';

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
'system_remove_from_channel';

export type PostEmbedType = 'image' | 'link' | 'message_attachment' | 'opengraph';

export type PostEmbed = {
    type: PostEmbedType;
    url: string;
    data: Record<string, OpenGraphMetadata>;
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
    parent_id: string;
    original_id: string;
    message: string;
    type: PostType;
    props: Record<string, any>;
    hashtags: string;
    pending_post_id: string;
    reply_count: number;
    file_ids?: any[];
    metadata: PostMetadata;
    failed?: boolean;
    user_activity_posts?: Post[];
    state?: 'DELETED';
    filenames?: string[];
    last_reply_at?: number;
    participants?: any; //Array<UserProfile | $ID<UserProfile>>;
    message_source?: string;
};

export type PostList = {
    order: string[];
    posts: Map<string, Post>;
    next_post_id: string;
    prev_post_id: string;
};

export type PostSearchResults = PostList & {
    matches: Record<string, string[]>;
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
