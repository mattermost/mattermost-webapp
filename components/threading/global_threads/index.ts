// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';

import {getThreads} from 'mattermost-redux/reducers/entities/threads';

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
                last_reply_at: 1606243938243,
                last_viewed_at: 1606243938243,
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
            {
                id: 'crunjug4fbnnubod83n6nduk6a',
                reply_count: 7,
                unreadReplies: 0,
                unreadMentions: 0,
                last_reply_at: 1606243949243,
                last_viewed_at: 1606243949243,
                participants: [
                    {id: 'skqk895x1fbodjnejtmhhit4co', first_name: 'Jack', last_name: 'Wheeler', username: 'jack.wheeler'},
                ],
                post: {
                    id: 'crunjug4fbnnubod83n6nduk6a',
                    create_at: 1603486174547,
                    update_at: 1607013846502,
                    edit_at: 0,
                    delete_at: 0,
                    is_pinned: false,
                    user_id: 'skqk895x1fbodjnejtmhhit4co',
                    channel_id: '3yyuf5cxkibeppm9kq3iimmb5y',
                    root_id: "",
                    parent_id: "",
                    original_id: "",
                    message: "quae ad error. velit ut eius. consequatur tenetur consequuntur error accusamus. doloribus nostrum tenetur molestiae beatae. eum et aut iure ratione atque excepturi. exercitationem recusandae aut eius aut sequi exercitationem consequatur minima. aperiam dolor aperiam. et illum unde laboriosam. optio placeat repudiandae animi fugiat quia. exercitationem voluptate ipsam laboriosam quia et cupiditate.",
                    type: "",
                    props: {},
                    hashtags: "",
                    pending_post_id: "",
                    has_reactions: true,
                    reply_count: 0,
                    metadata: {},
                },
            },
        ],
    };
};

export default connect(mapStateToProps)(GlobalThreads);
