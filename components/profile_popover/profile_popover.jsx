// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import LocalDateTime from 'components/local_date_time';
import UserSettingsModal from 'components/user_settings/modal';
import {browserHistory} from 'utils/browser_history';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import Constants, {ModalIdentifiers} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import Pluggable from 'plugins/pluggable';

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

        currentUserId: PropTypes.string.isRequired,
        teamUrl: PropTypes.string.isRequired,

        ...Popover.propTypes,

        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequred,
        }).isRequired,
    }

    static defaultProps = {
        isRHS: false,
        hasMention: false,
    }

    constructor(props) {
        super(props);

        this.handleShowDirectChannel = this.handleShowDirectChannel.bind(this);
        this.handleMentionKeyClick = this.handleMentionKeyClick.bind(this);
        this.handleEditAccountSettings = this.handleEditAccountSettings.bind(this);
        this.state = {
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
                browserHistory.push(`${this.props.teamUrl}/messages/@${user.username}`);
            }
        );
    }

    handleMentionKeyClick(e) {
        e.preventDefault();

        if (!this.props.user) {
            return;
        }
        if (this.props.hide) {
            this.props.hide();
        }
        EventEmitter.emit('mention_key_click', this.props.user.username);
    }

    handleEditAccountSettings(e) {
        e.preventDefault();

        if (!this.props.user) {
            return;
        }
        if (this.props.hide) {
            this.props.hide();
        }
        this.props.actions.openModal({ModalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal});
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
        delete popoverProps.enableTimezone;
        delete popoverProps.currentUserId;
        delete popoverProps.teamUrl;
        delete popoverProps.actions;

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
                    delayShow={Constants.OVERLAY_TIME_DELAY}
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
                    delayShow={Constants.OVERLAY_TIME_DELAY}
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

        dataContent.push(
            <Pluggable
                key='profilePopoverPluggable2'
                pluggableName='PopoverUserAttributes'
                user={this.props.user}
                status={this.props.status}
            />
        );

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

        if (this.props.user.id === this.props.currentUserId) {
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
                        <i
                            className='fa fa-pencil-square-o'
                            title={Utils.localizeMessage('generic_icons.edit', 'Edit Icon')}
                        />
                        <FormattedMessage
                            id='user_profile.account.editSettings'
                            defaultMessage='Edit Account Settings'
                        />
                    </a>
                </div>
            );
        }

        if (this.props.user.id !== this.props.currentUserId) {
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    key='user-popover-dm'
                    className='popover__row first'
                >
                    <a
                        href='#'
                        className='text-nowrap user-popover__email'
                        onClick={this.handleShowDirectChannel}
                    >
                        <i
                            className='fa fa-paper-plane'
                            title={Utils.localizeMessage('user_profile.send.dm.icon', 'Send Message Icon')}
                        />
                        <FormattedMessage
                            id='user_profile.send.dm'
                            defaultMessage='Send Message'
                        />
                    </a>
                </div>
            );
        }

        dataContent.push(
            <Pluggable
                key='profilePopoverPluggable3'
                pluggableName='PopoverUserActions'
                user={this.props.user}
                status={this.props.status}
            />
        );

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
