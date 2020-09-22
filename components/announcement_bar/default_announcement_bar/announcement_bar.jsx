// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import PropTypes from 'prop-types';
import {Tooltip} from 'react-bootstrap';

import {Constants, AnnouncementBarTypes, ModalIdentifiers} from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';
import WarnMetricAckModal from 'components/warn_metric_ack_modal';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

import {trackEvent} from 'actions/diagnostics_actions.jsx';

export default class AnnouncementBar extends React.PureComponent {
    static propTypes = {
        showCloseButton: PropTypes.bool,
        color: PropTypes.string,
        textColor: PropTypes.string,
        type: PropTypes.string,
        message: PropTypes.node.isRequired,
        handleClose: PropTypes.func,
        announcementBarCount: PropTypes.number.isRequired,
        showModal: PropTypes.bool,
        modalButtonText: PropTypes.string,
        modalButtonDefaultText: PropTypes.string,
        warnMetricStatus: PropTypes.object,
        actions: PropTypes.shape({
            incrementAnnouncementBarCount: PropTypes.func.isRequired,
            decrementAnnouncementBarCount: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        showCloseButton: false,
        color: '',
        textColor: '',
        type: AnnouncementBarTypes.CRITICAL,
        handleClose: null,
    }

    componentDidMount() {
        this.props.actions.incrementAnnouncementBarCount();

        document.body.classList.add('announcement-bar--fixed');
    }

    componentWillUnmount() {
        if (this.props.announcementBarCount === 1) {
            document.body.classList.remove('announcement-bar--fixed');
        }

        this.props.actions.decrementAnnouncementBarCount();
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
        } else if (this.props.type === AnnouncementBarTypes.ADVISOR) {
            barClass = 'announcement-bar announcement-bar-advisor';
        } else if (this.props.type === AnnouncementBarTypes.ADVISOR_ACK) {
            barClass = 'announcement-bar announcement-bar-advisor-ack';
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
                        <span className='announcement-bar__link'>
                            {this.props.showModal &&
                                <FormattedMessage
                                    id={this.props.modalButtonText}
                                    defaultMessage={this.props.modalButtonDefaultText}
                                >
                                    {(linkmessage) => (
                                        <ToggleModalButtonRedux
                                            accessibilityLabel={linkmessage}
                                            className={'color--link--adminack'}
                                            dialogType={WarnMetricAckModal}
                                            onClick={() => trackEvent('admin', 'click_warn_metric_learn_more')}
                                            modalId={ModalIdentifiers.WARN_METRIC_ACK}
                                            dialogProps={{
                                                warnMetricStatus: this.props.warnMetricStatus,
                                                closeParentComponent: this.props.handleClose,
                                            }}
                                        >
                                            {linkmessage}
                                        </ToggleModalButtonRedux>
                                    )}
                                </FormattedMessage>
                            }
                        </span>
                    </span>
                </OverlayTrigger>
                {closeButton}
            </div>
        );
    }
}
