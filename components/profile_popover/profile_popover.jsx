// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import LocalDateTime from 'components/local_date_time';
import {browserHistory} from 'utils/browser_history';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebrtcActions from 'actions/webrtc_actions.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

const UserStatuses = Constants.UserStatuses;
const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

/**
 * The profile popover, or hovercard, that appears with user information when clicking
 * on the username or profile picture of a user.
 */
class ProfilePopover extends React.Component {
    static getComponentName() {
        return 'ProfilePopover';
    }

    static propTypes = {

        /**
         * Source URL from the image to display in the popover
         */
        src: PropTypes.string.isRequired,

        /**
         * User the popover is being opened for
         */
        user: PropTypes.object.isRequired,

        /**
         * Status for the user, either 'offline', 'away', 'dnd' or 'online'
         */
        status: PropTypes.string,

        /**
         * Set to true if the user is in a WebRTC call
         */
        isBusy: PropTypes.bool,

        /**
         * Function to call to hide the popover
         */
        hide: PropTypes.func,

        /**
         * Set to true if the popover was opened from the right-hand
         * sidebar (comment thread, search results, etc.)
         */
        isRHS: PropTypes.bool,

        /**
         * @internal
         */
        hasMention: PropTypes.bool,

        /**
         * Whether or not WebRtc is enabled.
         */
        enableWebrtc: PropTypes.bool.isRequired,

        ...Popover.propTypes,
    }

    static defaultProps = {
        isRHS: false,
        hasMention: false,
    }

    constructor(props) {
        super(props);

        this.initWebrtc = this.initWebrtc.bind(this);
        this.handleShowDirectChannel = this.handleShowDirectChannel.bind(this);
        this.handleMentionKeyClick = this.handleMentionKeyClick.bind(this);
        this.handleEditAccountSettings = this.handleEditAccountSettings.bind(this);
        this.state = {
            currentUserId: UserStore.getCurrentId(),
            loadingDMChannel: -1,
        };
    }
    shouldComponentUpdate(nextProps) {
        if (!Utils.areObjectsEqual(nextProps.user, this.props.user)) {
            return true;
        }

        if (nextProps.src !== this.props.src) {
            return true;
        }

        if (nextProps.status !== this.props.status) {
            return true;
        }

        if (nextProps.isBusy !== this.props.isBusy) {
            return true;
        }

        // React-Bootstrap Forwarded Props from OverlayTrigger to Popover
        if (nextProps.arrowOffsetLeft !== this.props.arrowOffsetLeft) {
            return true;
        }

        if (nextProps.arrowOffsetTop !== this.props.arrowOffsetTop) {
            return true;
        }

        if (nextProps.positionLeft !== this.props.positionLeft) {
            return true;
        }

        if (nextProps.positionTop !== this.props.positionTop) {
            return true;
        }

        return false;
    }

    handleShowDirectChannel(e) {
        e.preventDefault();

        if (!this.props.user) {
            return;
        }

        const user = this.props.user;

        if (this.state.loadingDMChannel !== -1) {
            return;
        }

        this.setState({loadingDMChannel: user.id});

        openDirectChannelToUser(
            user.id,
            () => {
                if (Utils.isMobile()) {
                    GlobalActions.emitCloseRightHandSide();
                }
                this.setState({loadingDMChannel: -1});
                if (this.props.hide) {
                    this.props.hide();
                }
                browserHistory.push(`${TeamStore.getCurrentTeamRelativeUrl()}/messages/@${user.username}`);
            }
        );
    }

    initWebrtc() {
        if (this.props.status !== UserStatuses.OFFLINE && !WebrtcStore.isBusy()) {
            GlobalActions.emitCloseRightHandSide();
            WebrtcActions.initWebrtc(this.props.user.id, true);
        }
    }

    handleMentionKeyClick(e) {
        e.preventDefault();

        if (!this.props.user) {
            return;
        }
        if (this.props.hide) {
            this.props.hide();
        }
        GlobalActions.emitPopoverMentionKeyClick(this.props.isRHS, this.props.user.username);
    }

    handleEditAccountSettings(e) {
        e.preventDefault();

        if (!this.props.user) {
            return;
        }
        if (this.props.hide) {
            this.props.hide();
        }
        GlobalActions.showAccountSettingsModal();
    }

    render() {
        const popoverProps = Object.assign({}, this.props);
        delete popoverProps.user;
        delete popoverProps.src;
        delete popoverProps.status;
        delete popoverProps.isBusy;
        delete popoverProps.hide;
        delete popoverProps.isRHS;
        delete popoverProps.hasMention;
        delete popoverProps.dispatch;
        delete popoverProps.enableWebrtc;
        delete popoverProps.enableTimezone;

        let webrtc;
        const userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        const webrtcEnabled = this.props.enableWebrtc && userMedia && Utils.isFeatureEnabled(PreReleaseFeatures.WEBRTC_PREVIEW);

        if (webrtcEnabled && this.props.user.id !== this.state.currentUserId) {
            const isOnline = this.props.status !== UserStatuses.OFFLINE;
            let webrtcMessage;
            if (isOnline && !this.props.isBusy) {
                webrtcMessage = (
                    <FormattedMessage
                        id='user_profile.webrtc.call'
                        defaultMessage='Start Video Call'
                    />
                );
            } else if (this.props.isBusy) {
                webrtcMessage = (
                    <FormattedMessage
                        id='user_profile.webrtc.unavailable'
                        defaultMessage='New call unavailable until your existing call ends'
                    />
                );
            } else {
                webrtcMessage = (
                    <FormattedMessage
                        id='user_profile.webrtc.offline'
                        defaultMessage='The user is offline'
                    />
                );
            }

            webrtc = (
                <div
                    data-toggle='tooltip'
                    key='makeCall'
                    className='popover__row'
                >
                    <a
                        href='#'
                        className='text-nowrap user-popover__email'
                        onClick={this.initWebrtc}
                        disabled={!isOnline}
                    >
                        <i className='fa fa-video-camera'/>
                        {webrtcMessage}
                    </a>
                </div>
            );
        }

        var dataContent = [];
        dataContent.push(
            <img
                className='user-popover__image'
                alt={`${this.props.user.username || 'user'} profile image`}
                src={this.props.src}
                height='128'
                width='128'
                key='user-popover-image'
            />
        );

        const fullname = Utils.getFullName(this.props.user);
        if (fullname) {
            dataContent.push(
                <OverlayTrigger
                    delayShow={Constants.WEBRTC_TIME_DELAY}
                    placement='top'
                    overlay={<Tooltip id='fullNameTooltip'>{fullname}</Tooltip>}
                    key='user-popover-fullname'
                >
                    <div
                        className='overflow--ellipsis text-nowrap padding-top'
                    >
                        <strong>{fullname}</strong>
                    </div>
                </OverlayTrigger>
            );
        }

        if (this.props.user.position) {
            const position = this.props.user.position.substring(0, Constants.MAX_POSITION_LENGTH);
            dataContent.push(
                <OverlayTrigger
                    delayShow={Constants.WEBRTC_TIME_DELAY}
                    placement='top'
                    overlay={<Tooltip id='positionTooltip'>{position}</Tooltip>}
                    key='user-popover-position'
                >
                    <div
                        className='overflow--ellipsis text-nowrap padding-bottom half'
                    >
                        {position}
                    </div>
                </OverlayTrigger>
            );
        }

        const email = this.props.user.email;
        if (email) {
            dataContent.push(
                <hr
                    key='user-popover-hr'
                    className='divider divider--expanded'
                />
            );

            dataContent.push(
                <div
                    data-toggle='tooltip'
                    title={email}
                    key='user-popover-email'
                >
                    <a
                        href={'mailto:' + email}
                        className='text-nowrap text-lowercase user-popover__email padding-bottom half'
                    >
                        {email}
                    </a>
                </div>
            );
        }

        if (this.props.enableTimezone && this.props.user.timezone) {
            dataContent.push(
                <div
                    key='user-popover-local-time'
                    className='padding-bottom half'
                >
                    <FormattedMessage
                        id='user_profile.account.localTime'
                        defaultMessage='Local Time: '
                    />
                    <LocalDateTime userTimezone={this.props.user.timezone}/>
                </div>
            );
        }

        if (this.props.user.id === UserStore.getCurrentId()) {
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    key='user-popover-settings'
                    className='popover__row first'
                >
                    <a
                        href='#'
                        onClick={this.handleEditAccountSettings}
                    >
                        <i className='fa fa-pencil-square-o'/>
                        <FormattedMessage
                            id='user_profile.account.editSettings'
                            defaultMessage='Edit Account Settings'
                        />
                    </a>
                </div>
            );
        }

        if (this.props.user.id !== UserStore.getCurrentId()) {
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    key='user-popover-dm'
                    className='popover__row first'
                >
                    <a
                        href='#'
                        className='text-nowrap text-lowercase user-popover__email'
                        onClick={this.handleShowDirectChannel}
                    >
                        <i className='fa fa-paper-plane'/>
                        <FormattedMessage
                            id='user_profile.send.dm'
                            defaultMessage='Send Message'
                        />
                    </a>
                </div>
            );
            dataContent.push(webrtc);
        }

        let title = `@${this.props.user.username}`;
        if (this.props.hasMention) {
            title = <a onClick={this.handleMentionKeyClick}>{title}</a>;
        }

        return (
            <Popover
                {...popoverProps}
                title={title}
                id='user-profile-popover'
            >
                {dataContent}
            </Popover>
        );
    }
}

delete ProfilePopover.propTypes.id;

export default ProfilePopover;
