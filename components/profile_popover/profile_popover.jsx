// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import EventEmitter from 'mattermost-redux/utils/event_emitter';
import {Permissions} from 'mattermost-redux/constants';

import LocalDateTime from 'components/local_date_time';
import UserSettingsModal from 'components/user_settings/modal';
import {browserHistory} from 'utils/browser_history';
import * as GlobalActions from 'actions/global_actions.jsx';
import Constants, {ModalIdentifiers} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import Pluggable from 'plugins/pluggable';

import AddUserToChannelModal from 'components/add_user_to_channel_modal';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

/**
 * The profile popover, or hovercard, that appears with user information when clicking
 * on the username or profile picture of a user.
 */
class ProfilePopover extends React.PureComponent {
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

        currentTeamId: PropTypes.string.isRequired,

        /**
         * @internal
         */
        hasMention: PropTypes.bool,

        /**
         * @internal
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * @internal
         */
        teamUrl: PropTypes.string.isRequired,

        /**
         * @internal
         */
        isTeamAdmin: PropTypes.bool.isRequired,

        /**
         * @internal
         */
        isChannelAdmin: PropTypes.bool.isRequired,

        /**
         * @internal
         */
        actions: PropTypes.shape({
            getMembershipForCurrentEntities: PropTypes.func.isRequired,
            openDirectChannelToUserId: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
        }).isRequired,

        ...Popover.propTypes,
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

    componentDidMount() {
        this.props.actions.getMembershipForCurrentEntities(this.props.user.id);
    }

    handleShowDirectChannel(e) {
        const {actions} = this.props;
        e.preventDefault();

        if (!this.props.user) {
            return;
        }

        const user = this.props.user;

        if (this.state.loadingDMChannel !== -1) {
            return;
        }

        this.setState({loadingDMChannel: user.id});

        actions.openDirectChannelToUserId(user.id).then((result) => {
            if (!result.error) {
                if (Utils.isMobile()) {
                    GlobalActions.emitCloseRightHandSide();
                }
                this.setState({loadingDMChannel: -1});
                if (this.props.hide) {
                    this.props.hide();
                }
                browserHistory.push(`${this.props.teamUrl}/messages/@${user.username}`);
            }
        });
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
        delete popoverProps.currentTeamId;
        delete popoverProps.teamUrl;
        delete popoverProps.actions;
        delete popoverProps.isTeamAdmin;
        delete popoverProps.isChannelAdmin;

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

        if (fullname || this.props.user.position) {
            dataContent.push(
                <hr
                    key='user-popover-hr'
                    className='divider divider--expanded'
                />
            );
        }

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
                    key='user-popover-hr2'
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

            dataContent.push(
                <TeamPermissionGate
                    teamId={this.props.currentTeamId}
                    permissions={[Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                    key='user-popover-add-to-channel'
                >
                    <div
                        data-toggle='tooltip'
                        className='popover__row first'
                    >
                        <a
                            href='#'
                            className='text-nowrap'
                        >
                            <ToggleModalButtonRedux
                                ref='addUserToChannelModalButton'
                                modalId={ModalIdentifiers.ADD_USER_TO_CHANNEL}
                                role='menuitem'
                                dialogType={AddUserToChannelModal}
                                dialogProps={{user: this.props.user}}
                                onClick={this.props.hide}
                            >
                                <i
                                    className='fa fa-user-plus'
                                    title={Utils.localizeMessage('user_profile.add_user_to_channel.icon', 'Add User to Channel Icon')}
                                />
                                <FormattedMessage
                                    id='user_profile.add_user_to_channel'
                                    defaultMessage='Add to a Channel'
                                />
                            </ToggleModalButtonRedux>
                        </a>
                    </div>
                </TeamPermissionGate>
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

        let roleTitle;
        if (Utils.isSystemAdmin(this.props.user.roles)) {
            roleTitle = <span className='user-popover__role'>{Utils.localizeMessage('admin.permissions.roles.system_admin.name', 'System Admin')}</span>;
        } else if (this.props.isTeamAdmin) {
            roleTitle = <span className='user-popover__role'>{Utils.localizeMessage('admin.permissions.roles.team_admin.name', 'Team Admin')}</span>;
        } else if (this.props.isChannelAdmin) {
            roleTitle = <span className='user-popover__role'>{Utils.localizeMessage('admin.permissions.roles.channel_admin.name', 'Channel Admin')}</span>;
        }

        let title = `@${this.props.user.username}`;
        if (this.props.hasMention) {
            title = <a onClick={this.handleMentionKeyClick}>{title}</a>;
        }
        title = <span><span className='user-popover__username'>{title}</span> {roleTitle}</span>;

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
