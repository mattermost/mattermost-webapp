// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Toast from './toast.jsx';

export default class UnreadToast extends React.PureComponent {
    static propTypes = {
        countUnread: PropTypes.number.isRequired,
        children: PropTypes.element,
        jumpTo: PropTypes.func.isRequired, // required?
        jumpToMessage: PropTypes.string,
        jumpFadeOutDelay: PropTypes.number,
        onDismiss: PropTypes.func,
        order: PropTypes.number,
        show: PropTypes.bool.isRequired,
        extraClasses: PropTypes.string,
        showOnlyOnce: PropTypes.bool,
    }

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
        this.props.onDismiss();
    }

    handleJump = () => {
        // set the unread count to the same as we currently have so it doesn't display
        this.setState({lastUnread: this.props.countUnread});
        this.props.jumpTo();
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
        passAlong.show = this.unreadShow();
        passAlong.onDismiss = this.handleDismiss;
        passAlong.jumpTo = this.handleJump;
        return (
            <Toast {...passAlong}/>
        );
    }
}

function empty() {
    // do nothing
}

UnreadToast.defaultProps = {
    onDismiss: empty,
};