// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from 'react-bootstrap';

import {Constants, AnnouncementBarTypes} from 'utils/constants';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';

export default class AnnouncementBar extends React.PureComponent {
    static propTypes = {
        showCloseButton: PropTypes.bool,
        color: PropTypes.string,
        textColor: PropTypes.string,
        type: PropTypes.string,
        message: PropTypes.node.isRequired,
        handleClose: PropTypes.func,
    }
    static defaultProps = {
        showCloseButton: false,
        color: '',
        textColor: '',
        type: AnnouncementBarTypes.CRITICAL,
        handleClose: null,
    }

    componentDidMount() {
        let announcementBarCount = document.body.getAttribute('announcementBarCount') || 0;
        announcementBarCount++;
        document.body.classList.add('announcement-bar--fixed');

        // keeping a track of mounted AnnouncementBars so that on the last AnnouncementBars unmount we can remove the class on body
        document.body.setAttribute('announcementBarCount', announcementBarCount);
    }

    componentWillUnmount() {
        let announcementBarCount = document.body.getAttribute('announcementBarCount');
        announcementBarCount--;
        document.body.setAttribute('announcementBarCount', announcementBarCount);

        // remove the class on body as it is the last announcementBar
        if (announcementBarCount === 0) {
            document.body.classList.remove('announcement-bar--fixed');
        }
    }

    handleClose = (e) => {
        e.preventDefault();
        if (this.props.handleClose) {
            this.props.handleClose();
        }
    }

    render() {
        if (!this.props.message) {
            return null;
        }

        let barClass = 'announcement-bar';
        const barStyle = {};
        const linkStyle = {};
        if (this.props.color && this.props.textColor) {
            barStyle.backgroundColor = this.props.color;
            barStyle.color = this.props.textColor;
            linkStyle.color = this.props.textColor;
        } else if (this.props.type === AnnouncementBarTypes.DEVELOPER) {
            barClass = 'announcement-bar announcement-bar-developer';
        } else if (this.props.type === AnnouncementBarTypes.CRITICAL) {
            barClass = 'announcement-bar announcement-bar-critical';
        } else if (this.props.type === AnnouncementBarTypes.SUCCESS) {
            barClass = 'announcement-bar announcement-bar-success';
        }

        let closeButton;
        if (this.props.showCloseButton) {
            closeButton = (
                <a
                    href='#'
                    className='announcement-bar__close'
                    style={linkStyle}
                    onClick={this.handleClose}
                >
                    {'×'}
                </a>
            );
        }

        let message = this.props.message;
        if (typeof message == 'string') {
            message = (
                <FormattedMarkdownMessage id={this.props.message}/>
            );
        }

        const announcementTooltip = (
            <Tooltip id='announcement-bar__tooltip'>
                {message}
            </Tooltip>
        );

        return (
            <div
                className={barClass}
                style={barStyle}
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={announcementTooltip}
                >
                    <span>
                        {message}
                    </span>
                </OverlayTrigger>
                {closeButton}
            </div>
        );
    }
}
