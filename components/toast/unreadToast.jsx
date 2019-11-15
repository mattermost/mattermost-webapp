// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Toast from './toast.jsx';

export default class UnreadToast extends React.PureComponent {
    static propTypes = {
        countUnread: PropTypes.number.isRequired,
        children: PropTypes.element,
        onClick: PropTypes.func.isRequired, // required?
        onClickMessage: PropTypes.string,
        onClickFadeOutDelay: PropTypes.number,
        onDismiss: PropTypes.func,
        order: PropTypes.number,
        show: PropTypes.bool.isRequired,
        extraClasses: PropTypes.string,
        showOnlyOnce: PropTypes.bool,
    }

    static defaultProps = {
        onDismiss: null,
    };

    constructor(props) {
        super(props);

        this.state = {lastUnread: 0};
    }

    unreadShow = () => {
        return this.props.show && this.state.lastUnread < this.props.countUnread;
    }

    handleDismiss = () => {
        // set the unread count to the same as we currently have so it doesn't display
        this.setState({lastUnread: this.props.countUnread});
        if (typeof this.props.onDismiss == 'function') {
            this.props.onDismiss();
        }
    }

    handleClick = () => {
        this.props.onClick();

        // set the unread count to the same as we currently have so it doesn't display
        setTimeout(() => this.setState({lastUnread: this.props.countUnread}), this.props.onClickFadeOutDelay);
    }

    static getDerivedStateFromProps(newProps, oldState) {
        const props = {};
        if (newProps.countUnread < oldState.countUnread) {
            // if we read the messages, set it to 0 so the toast shows
            props.countUnread = 0;
        }
        return props;
    }

    render() {
        const passAlong = {...this.props};
        delete passAlong.countUnread;
        delete passAlong.onClickFadeOutDelay;

        return (
            <Toast
                {...passAlong}
                show={this.unreadShow()}
                onDismiss={this.handleDismiss}
                onClick={this.handleClick}
            />
        );
    }
}