// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {AnnouncementBarTypes} from 'utils/constants.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

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
        let dismissClass = ' announcement-bar--fixed';
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
            dismissClass = '';
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

        return (
            <div
                className={barClass + dismissClass}
                style={barStyle}
            >
                <span>
                    {message}
                </span>
                {closeButton}
            </div>
        );
    }
}
