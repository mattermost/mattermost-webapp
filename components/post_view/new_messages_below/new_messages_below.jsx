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

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            rendered: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.newMessages > 0 && !nextProps.atBottom) {
            this.setState({rendered: true}, () => {
                this.setState({visible: true});
            });
        } else {
            this.setState({visible: false});
        }
    }

    render() {
        let className = 'new-messages__button';
        if (this.state.visible) {
            className += ' visible';
        }
        if (!this.state.rendered) {
            className += ' disabled';
        }
        return (
            <div
                className={className}
                onTransitionEnd={this.setRendered.bind(this)}
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

    // Sync 'rendered' state with visibility param, only after transitions
    // have ended
    setRendered() {
        this.setState({rendered: this.state.visible});
    }
}
