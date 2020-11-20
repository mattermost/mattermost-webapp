// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import GlobalThreads from './global_threads';

const mapStateToProps = (state: GlobalState): ComponentProps<typeof GlobalThreads> => {
    return {
        threads: [
            {
                id: 's47ncuhsxfd75ypcjuxgoqi3ne',
                reply_count: 5,
                unreadReplies: 3,
                unreadMentions: 1,
                last_reply_at: 12452736687,
                last_viewed_at: 1234895164,
                participants: [
                    {id: '4wcwm9k3qi8t9836bodcxn5ufa', first_name: 'Lisa', last_name: 'Gilbert', username: 'lisa.gilbert'},
                ],
                post: {
                    id: 's47ncuhsxfd75ypcjuxgoqi3ne',
                    create_at: 1603493078684,
                    update_at: 1603493172290,
                    edit_at: 0,
                    delete_at: 0,
                    is_pinned: false,
                    user_id: '4wcwm9k3qi8t9836bodcxn5ufa',
                    channel_id: '3yyuf5cxkibeppm9kq3iimmb5y',
                    root_id: '',
                    parent_id: '',
                    original_id: '',
                    message: 'natus nulla rerum qui quo qui. dolores aut minima quia nemo tempore velit dolorum quas error. aspernatur qui laudantium quos officia. praesentium ut sed in ullam ut. aspernatur a vel et occaecati. itaque dolores repellendus ea sit odio. ab autem veniam modi qui ut. beatae sint laboriosam magnam qui voluptatem. asperiores modi possimus et.\nexercitationem velit et corporis ea.',
                    props: {},
                    hashtags: '',
                    pending_post_id: '',
                    reply_count: 0,
                },
            },
        ],
    };
};

export default connect(mapStateToProps)(GlobalThreads);
