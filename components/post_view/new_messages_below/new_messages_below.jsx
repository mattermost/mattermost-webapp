// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import UnreadBelowIcon from 'components/widgets/icons/unread_below_icon';

export default class NewMessagesBelow extends React.PureComponent {
    static propTypes = {
        atBottom: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
        newMessages: PropTypes.number,
    };

    static defaultProps = {
        newMessages: 0,
    };

    isVisible() {
        return this.props.newMessages > 0 && !this.props.atBottom;
    }

    render() {
        let className = 'new-messages__button';
        if (this.isVisible()) {
            className += ' visible';
        }
        return (
            <div
                className={className}
                ref='indicator'
            >
                <div onClick={this.props.onClick}>
                    <FormattedMessage
                        id='posts_view.newMsgBelow'
                        defaultMessage='New {count, plural, one {message} other {messages}}'
                        values={{count: this.props.newMessages}}
                    />
                    <UnreadBelowIcon className='icon icon__unread'/>
                </div>
            </div>
        );
    }
}
