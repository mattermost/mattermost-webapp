// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import UnreadBelowIcon from 'components/widgets/icons/unread_below_icon';
import CloseIcon from 'components/widgets/icons/close_icon';
import Constants from 'utils/constants';

const MIN_TOAST_HEIGHT = 1000;

export default class Toast extends React.PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        onClickMessage: PropTypes.string,
        onDismiss: PropTypes.func,
        children: PropTypes.element,
        show: PropTypes.bool.isRequired,
        showActions: PropTypes.bool, //used for showing jump actions
    }

    handleClick = () => {
        this.props.onClick();
    }

    handleDismiss = () => {
        if (typeof this.props.onDismiss == 'function') {
            this.props.onDismiss();
        }
    }

    render() {
        let toastClass = 'toast';
        if (this.props.show) {
            toastClass += ' toast__visible';
        }

        const jumpSection = () => {
            if (this.props.showActions) {
                return (
                    <div
                        className='toast__jump'
                        onClick={this.handleClick}
                    >
                        <UnreadBelowIcon/>
                        {this.props.onClickMessage}
                    </div>
                );
            }
            return null;
        };

        const closeTooltip = (
            <Tooltip id='toast-close__tooltip'>
                <FormattedMessage
                    id='postlist.toast.markAsRead'
                    defaultMessage='Mark as read'
                />
            </Tooltip>
        );

        return (
            <div
                className={toastClass}
                style={{zIndex: MIN_TOAST_HEIGHT}}
            >
                {jumpSection()}
                <div className='toast__message'>
                    {this.props.children}
                </div>
                <div
                    className='toast__dismiss'
                    onClick={this.handleDismiss}
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={closeTooltip}
                    >
                        <CloseIcon
                            className='close-x'
                            id='dismissToast'
                        />
                    </OverlayTrigger>
                </div>
            </div>
        );
    }
}
