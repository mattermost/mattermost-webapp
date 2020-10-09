// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from 'mattermost-redux/types/posts';

export const postProps: Post = {
    edit_at: 0,
    original_id: '',
    hashtags: '',
    pending_post_id: '',
    reply_count: 0,
    metadata: {
        embeds: [],
        emojis: [],
        files: [],
        images: {},
        reactions: [],
    },
    channel_id: '',
    create_at: 0,
    delete_at: 0,
    id: 'id',
    is_pinned: false,
    message: 'post message',
    parent_id: '',
    props: {},
    root_id: '',
    type: 'system_add_remove',
    update_at: 0,
    user_id: 'user_id',
};
