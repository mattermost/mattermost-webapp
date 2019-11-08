// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import UnreadBelowIcon from 'components/widgets/icons/unread_below_icon';
import CloseIcon from 'components/widgets/icons/close_icon';

const MIN_TOAST_HEIGHT = 1000;

export default class Toast extends React.PureComponent {
    static propTypes = {
        onClick: PropTypes.func.isRequired, // required?
        onClickMessage: PropTypes.string,
        onClickFadeOutDelay: PropTypes.number,
        onDismiss: PropTypes.func,
        order: PropTypes.number,
        children: PropTypes.element,
        show: PropTypes.bool.isRequired,
        extraClasses: PropTypes.string,
        showOnlyOnce: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {

            //once hide is set to true, only mounting again from the caller will show it again. This way, once we have used one button the toast doesn't show up again.
            // if it should only be shown once, we set it to the value of show.
            hide: this.props.showOnlyOnce ? !this.props.show : false,
        };
    }

    shouldNeverShowAgain = () => {
        // if it should never be seen again, hide it
        if (this.props.showOnlyOnce) {
            this.setState({hide: true});
        }
    }

    handleClick = () => {
        this.props.onClick();
        setTimeout(() => this.shouldNeverShowAgain(), this.props.onClickFadeOutDelay);

        // TODO: telemetry
    }

    handleDismiss = () => {
        if (typeof this.props.onDismiss == 'function') {
            this.props.onDismiss();
        }
        this.shouldNeverShowAgain();

        // TODO: add telemetry
    }

    render() {
        let classes = `toast ${this.props.extraClasses}`;
        if (this.props.show && !this.state.hide) {
            classes += ' toast__visible';
        }

        return (
            <div
                className={classes}
                style={{zIndex: this.props.order + MIN_TOAST_HEIGHT}}
            >
                <div
                    className='toast__jump'
                    onClick={this.handleClick}
                >
                    <UnreadBelowIcon/>
                    {this.props.onClickMessage}
                </div>
                <div className='toast__message'>
                    {this.props.children}
                </div>
                <div
                    className='toast__dismiss'
                    onClick={this.handleDismiss}
                >
                    <CloseIcon
                        className='close-x'
                        id='dismissToast'
                    />
                </div>
            </div>
        );
    }
}

Toast.defaultProps = {
    onDismiss: null,
    onClickMessage: 'Jump',
    order: 0,
    jumpFadeOutDelay: 0,
    showOnlyOnce: false,
};