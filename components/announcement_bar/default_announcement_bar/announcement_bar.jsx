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

import {trackEvent} from 'actions/telemetry_actions.jsx';

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
        showLinkAsButton: PropTypes.bool,
        warnMetricStatus: PropTypes.object,
        isTallBanner: PropTypes.bool,
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
        onButtonClick: null,
        showLinkAsButton: false,
        isTallBanner: false,
    }

    componentDidMount() {
        this.props.actions.incrementAnnouncementBarCount();
        if (this.props.isTallBanner) {
            document.body.classList.add('announcement-banner-tall--fixed');
        } else {
            document.body.classList.add('announcement-bar--fixed');
        }
    }

    componentWillUnmount() {
        if (this.props.announcementBarCount === 1 && !this.props.isTallBanner) {
            document.body.classList.remove('announcement-bar--fixed');
        } else if (this.props.announcementBarCount === 1 && this.props.isTallBanner) {
            document.body.classList.remove('announcement-banner-tall--fixed');
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
        } else if (this.props.type === AnnouncementBarTypes.CRITICAL_LIGHT) {
            barClass = 'announcement-bar announcement-bar-critical-light';
        }

        if (this.props.isTallBanner) {
            barClass += ' tall';
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
                    {this.props.isTallBanner ? '\uF156' : '×'}
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
                        {this.props.showLinkAsButton &&
                            (this.props.showCloseButton ? <div className={'content__icon'}>{'\uF5D6'}</div> : <div className={'content__icon'}>{'\uF02A'}</div>)
                        }
                        {message}
                        {
                            !this.props.showLinkAsButton &&
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
                        }
                        {
                            this.props.showLinkAsButton &&
                            <button
                                onClick={this.props.showModal}
                                className='upgrade-button'
                            >
                                <FormattedMessage
                                    id={this.props.modalButtonText}
                                    defaultMessage={this.props.modalButtonDefaultText}
                                />
                            </button>
                        }
                    </span>
                </OverlayTrigger>
                {closeButton}
            </div>
        );
    }
}
