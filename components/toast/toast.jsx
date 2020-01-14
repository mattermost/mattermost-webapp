// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import UnreadBelowIcon from 'components/widgets/icons/unread_below_icon';
import CloseIcon from 'components/widgets/icons/close_icon';
import Constants from 'utils/constants';

import './toast.scss';

export default class Toast extends React.PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        onClickMessage: PropTypes.string,
        onDismiss: PropTypes.func,
        children: PropTypes.element,
        show: PropTypes.bool.isRequired,
        showActions: PropTypes.bool, //used for showing jump actions
        width: PropTypes.number,
        toastTimer: PropTypes.number,
    }

    constructor(props) {
        super(props);
        this.state = {
            show: props.show,
        };
    }

    static getDerivedStateFromProps(props) {
        const {show} = props;
        if (show) {
            return {
                show,
            };
        }
        return null;
    }

    componentDidUpdate(prevProps) {
        const {show, toastTimer} = this.props;
        if (prevProps.show && !show) {
            setTimeout(() => {
                this.setState({show});
            }, toastTimer);
        }
    }

    handleDismiss = () => {
        if (typeof this.props.onDismiss == 'function') {
            this.props.onDismiss();
        }
    }

    render() {
        let toastClass = 'toast';
        const {show} = this.state;
        if (show) {
            toastClass += ' toast__visible';
        }

        let toastActionClass = 'toast__message';
        if (this.props.showActions) {
            toastActionClass += ' toast__pointer';
        }

        const jumpSection = () => {
            return (
                <div
                    className='toast__jump'
                >
                    <UnreadBelowIcon/>
                    {this.props.width > Constants.MOBILE_SCREEN_WIDTH && this.props.onClickMessage}
                </div>
            );
        };

        let closeTooltip = (<div/>);
        if (this.props.showActions && show) {
            closeTooltip = (
                <Tooltip id='toast-close__tooltip'>
                    <FormattedMessage
                        id='general_button.close'
                        defaultMessage='Close'
                    />
                    <div className='tooltip__shortcut--txt'>
                        <FormattedMessage
                            id='general_button.esc'
                            defaultMessage='esc'
                        />
                    </div>
                </Tooltip>
            );
        }

        return (
            <div className={toastClass}>
                <div
                    className={toastActionClass}
                    onClick={this.props.showActions ? this.props.onClick : null}
                >
                    {this.props.showActions && jumpSection()}
                    {this.props.children}
                </div>
                <div
                    className='toast__dismiss'
                    onClick={this.handleDismiss}
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='bottom'
                        overlay={closeTooltip}
                    >
                        <CloseIcon
                            className='close-btn'
                            id='dismissToast'
                        />
                    </OverlayTrigger>
                </div>
            </div>
        );
    }
}
