// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {FormattedMessage} from 'react-intl';

import {WebSocketMessage} from 'mattermost-redux/types/websocket';

import {useWebsocket} from 'components/websocket/hook';

import {SocketEvents} from 'utils/constants';

type Props = {
    channelId: string;
    postId: string;

    typingUsers: string[];

    userStartedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStoppedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
}

export default function MsgTyping(props: Props) {
    // I wonder if this should be pulled out of the component for cleanliness sake?
    const {userStartedTyping, userStoppedTyping} = props;
    useWebsocket({

        // I'm not particularly happy with the useMemos here since I'd prefer if this was automatic, but it's good
        // enough for now
        handler: useMemo(() => (msg: WebSocketMessage<any>) => {
            if (msg.event === SocketEvents.TYPING) {
                const channelId = msg.data.channel_id;
                const rootId = msg.data.parent_id; // Yes, this uses the old "parent_id" name
                const userId = msg.data.user_id;

                userStartedTyping(userId, channelId, rootId, Date.now());
            } else if (msg.event === SocketEvents.POSTED) {
                // This is more for demo purposes. Ideally, we'd just have the typing reducer handle a RECEIVED_NEW_POST

                const post = JSON.parse(msg.data.post);

                const channelId = post.channel_id;
                const rootId = post.root_id;
                const userId = post.user_id;

                userStoppedTyping(userId, channelId, rootId, Date.now());
            }
        }, [userStartedTyping, userStoppedTyping]),
        scopes: useMemo(() => [`typing:${props.channelId}:${props.postId}`], [props.channelId, props.postId]),
    });

    // Everything below here is existing code
    const getTypingText = () => {
        let users: string[] = [];
        let numUsers = 0;
        if (props.typingUsers) {
            users = [...props.typingUsers];
            numUsers = users.length;
        }

        if (numUsers === 0) {
            return '';
        }
        if (numUsers === 1) {
            return (
                <FormattedMessage
                    id='msg_typing.isTyping'
                    defaultMessage='{user} is typing...'
                    values={{
                        user: users[0],
                    }}
                />
            );
        }
        const last = users.pop();
        return (
            <FormattedMessage
                id='msg_typing.areTyping'
                defaultMessage='{users} and {last} are typing...'
                values={{
                    users: (users.join(', ')),
                    last,
                }}
            />
        );
    };

    return (
        <span className='msg-typing'>{getTypingText()}</span>
    );
}
