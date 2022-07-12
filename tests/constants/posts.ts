// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@mattermost/types/posts';

export const emptyPost: () => Post = () => ({
    id: '',
    create_at: 0,
    update_at: 0,
    edit_at: 0,
    delete_at: 0,
    is_pinned: false,
    user_id: '',
    channel_id: '',
    root_id: '',
    original_id: '',
    message: '',
    type: '',
    props: {},
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
});
