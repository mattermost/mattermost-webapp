// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class MsgTyping extends React.Component {
    static propTypes = {
        typingUsers: PropTypes.array.isRequired,
    }

    getTypingText = () => {
        let users = [];
        let numUsers = 0;
        if (this.props.typingUsers) {
            users = [...this.props.typingUsers];
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
    }

    render() {
        return (
            <span className='msg-typing'>{this.getTypingText()}</span>
        );
    }
}
