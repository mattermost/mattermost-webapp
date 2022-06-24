// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {WebSocketMessage} from 'mattermost-redux/types/websocket';

import {useWebsocket} from 'components/websocket/hook';

import {SocketEvents} from 'utils/constants';

type Props = {
    typingUsers: string[];

    userStartedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStoppedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
}

export default function MsgTyping(props: Props) {
    useWebsocket({
        handler: (msg: WebSocketMessage<any>) => {
            if (msg.event === SocketEvents.TYPING) {
                const channelId = msg.broadcast.channel_id;
                const rootId = msg.data.parent_id; // Yes, this uses the old naming
                const userId = msg.data.user_id;

                props.userStartedTyping(userId, channelId, rootId, Date.now());
            } else if (msg.event === SocketEvents.POSTED) {
                // This is more for demo purposes. Ideally, we'd just clear this state on a RECEIVED_NEW_POST

                const post = JSON.parse(msg.data.post);

                const channelId = post.channel_id;
                const rootId = post.root_id;
                const userId = post.user_id;

                props.userStoppedTyping(userId, channelId, rootId, Date.now());
            }
        },
    });

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
