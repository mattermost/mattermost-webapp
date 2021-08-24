// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import EventEmitter from 'mattermost-redux/utils/event_emitter';
import StatusIcon from 'components/status_icon';
import Timestamp from 'components/timestamp';
import OverlayTrigger from 'components/overlay_trigger';
import UserSettingsModal from 'components/user_settings/modal';
import {browserHistory} from 'utils/browser_history';
import * as GlobalActions from 'actions/global_actions';
import Constants, {ModalIdentifiers, UserStatuses} from 'utils/constants';
import {t} from 'utils/i18n';
import * as Utils from 'utils/utils.jsx';
import Pluggable from 'plugins/pluggable';
import AddUserToChannelModal from 'components/add_user_to_channel_modal';
import LocalizedIcon from 'components/localized_icon';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import Avatar from 'components/widgets/users/avatar';
import Popover from 'components/widgets/popover';
import SharedUserIndicator from 'components/shared_user_indicator';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import CustomStatusModal from 'components/custom_status/custom_status_modal';
import CustomStatusText from 'components/custom_status/custom_status_text';
import ExpiryTime from 'components/custom_status/expiry_time';
import {UserCustomStatus, UserProfile, UserTimezone, CustomStatusDuration} from 'mattermost-redux/types/users';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {ServerError} from 'mattermost-redux/types/errors';

import './profile_popover.scss';

interface ProfilePopoverProps extends Omit<React.ComponentProps<typeof Popover>, 'id'>{

    /**
     * Source URL from the image to display in the popover
     */
    src: string;

    /**
     * Source URL from the image that should override default image
     */
    overwriteIcon?: string;

    /**
     * User the popover is being opened for
     */
    user?: Partial<UserProfile>;
    userId: string;
    channelId?: string;

    /**
     * Status for the user, either 'offline', 'away', 'dnd' or 'online'
     */
    status?: string;
    hideStatus?: boolean;

    /**
     * Function to call to hide the popover
     */
    hide?: () => void;

    /**
     * Set to true if the popover was opened from the right-hand
     * sidebar (comment thread, search results, etc.)
     */
    isRHS?: boolean;
    isBusy?: boolean;

    /**
     * Returns state of modals in redux for determing which need to be closed
     */
    modals?: {
        [modalId: string]: {
            open: boolean;
            dialogProps: Dictionary<any>;
            dialogType: React.Component;
        };
    };
    currentTeamId: string;

    /**
     * @internal
     */
    currentUserId: string;
    customStatus?: UserCustomStatus | null;
    isCustomStatusEnabled: boolean;
    isCustomStatusExpired: boolean;
    currentUserTimezone?: string;

    /**
     * @internal
     */
    hasMention?: boolean;

    /**
     * @internal
     */
    isInCurrentTeam: boolean;

    /**
     * @internal
     */
    teamUrl: string;

    /**
     * @internal
     */
    isTeamAdmin: boolean;

    /**
     * @internal
     */
    isChannelAdmin: boolean;

    /**
     * @internal
     */
    canManageAnyChannelMembersInCurrentTeam: boolean;

    /**
     * The overwritten username that should be shown at the top of the popover
     */
    overwriteName?: React.ReactNode;

    /**
     * @internal
     */
    enableTimezone: boolean;
    actions: {
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => Promise<{
            data: boolean;
        }>;
        closeModal: (modalId: string) => Promise<{
            data: boolean;
        }>;
        openDirectChannelToUserId: (userId?: string) => Promise<{error: ServerError}>;
        getMembershipForEntities: (teamId: string, userId: string, channelId?: string) => Promise<void>;
    };
    intl: IntlShape;
}
type ProfilePopoverState = {
    loadingDMChannel?: string;
};

/**
 * The profile popover, or hovercard, that appears with user information when clicking
 * on the username or profile picture of a user.
 */
class ProfilePopover extends React.PureComponent<
ProfilePopoverProps,
ProfilePopoverState
> {
    static getComponentName() {
        return 'ProfilePopover';
    }
    static defaultProps = {
        isRHS: false,
        hasMention: false,
        status: UserStatuses.OFFLINE,
        customStatus: null,
    };
    constructor(props: ProfilePopoverProps) {
        super(props);
        this.state = {
            loadingDMChannel: undefined,
        };
    }
    componentDidMount() {
        const {currentTeamId, userId, channelId} = this.props;
        if (currentTeamId && userId) {
            this.props.actions.getMembershipForEntities(
                currentTeamId,
                userId,
                channelId,
            );
        }
    }
    handleShowDirectChannel = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const {actions} = this.props;
        e.preventDefault();
        if (!this.props.user) {
            return;
        }
        const user = this.props.user;
        if (this.state.loadingDMChannel !== undefined) {
            return;
        }
        this.setState({loadingDMChannel: user.id});
        actions.openDirectChannelToUserId(user.id).then((result: {error: ServerError}) => {
            if (!result.error) {
                if (Utils.isMobile()) {
                    GlobalActions.emitCloseRightHandSide();
                }
                this.setState({loadingDMChannel: undefined});
                if (this.props.hide) {
                    this.props.hide();
                }
                browserHistory.push(`${this.props.teamUrl}/messages/@${user.username}`);
            }
        });
        this.handleCloseModals();
    };
    handleMentionKeyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (!this.props.user) {
            return;
        }
        if (this.props.hide) {
            this.props.hide();
        }
        EventEmitter.emit(
            'mention_key_click',
            this.props.user.username,
            this.props.isRHS,
        );
        this.handleCloseModals();
    };
    handleEditAccountSettings = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (!this.props.user) {
            return;
        }
        if (this.props.hide) {
            this.props.hide();
        }
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {isContentProductSettings: false},
        });
        this.handleCloseModals();
    };
    showCustomStatusModal = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (this.props.hide) {
            this.props.hide();
        }
        const customStatusInputModalData = {
            modalId: ModalIdentifiers.CUSTOM_STATUS,
            dialogType: CustomStatusModal,
        };
        this.props.actions.openModal(customStatusInputModalData);
    };
    handleAddToChannel = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        this.handleCloseModals();
    };
    handleCloseModals = () => {
        const {modals} = this.props;
        for (const modal in modals) {
            if (!Object.prototype.hasOwnProperty.call(modals, modal)) {
                continue;
            }
            if (modals[modal].open) {
                this.props.actions.closeModal(modal);
            }
        }
    };
    renderCustomStatus() {
        const {
            customStatus,
            isCustomStatusEnabled,
            user,
            currentUserId,
            hideStatus,
            isCustomStatusExpired,
        } = this.props;
        const customStatusSet = (customStatus?.text || customStatus?.emoji) && !isCustomStatusExpired;
        const canSetCustomStatus = user?.id === currentUserId;
        const shouldShowCustomStatus =
      isCustomStatusEnabled &&
      !hideStatus &&
      (customStatusSet || canSetCustomStatus);
        if (!shouldShowCustomStatus) {
            return null;
        }
        let customStatusContent;
        let expiryContent;
        if (customStatusSet) {
            const customStatusEmoji = (
                <span className='d-flex'>
                    <CustomStatusEmoji
                        userID={this.props.user?.id}
                        showTooltip={false}
                        emojiStyle={{
                            marginRight: 4,
                            marginTop: 1,
                        }}
                    />
                </span>
            );
            customStatusContent = (
                <div className='d-flex'>
                    {customStatusEmoji}
                    <CustomStatusText
                        tooltipDirection='top'
                        text={customStatus?.text || ''}
                        className='user-popover__email pb-1'
                    />
                </div>
            );

            expiryContent = customStatusSet && customStatus?.expires_at && customStatus.duration !== CustomStatusDuration.DONT_CLEAR && (
                <ExpiryTime
                    time={customStatus.expires_at}
                    timezone={this.props.currentUserTimezone}
                    className='ml-1'
                    withinBrackets={true}
                />
            );
        } else if (canSetCustomStatus) {
            customStatusContent = (
                <div>
                    <button
                        className='user-popover__set-custom-status-btn'
                        onClick={this.showCustomStatusModal}
                    >
                        <FormattedMessage
                            id='user_profile.custom_status.set_status'
                            defaultMessage='Set a status'
                        />
                    </button>
                </div>
            );
        }

        return {customStatusContent, expiryContent};
    }
    render() {
        if (!this.props.user) {
            return null;
        }

        const keysToBeRemoved: Array<keyof ProfilePopoverProps> = ['user', 'userId', 'channelId', 'src', 'status', 'hideStatus', 'isBusy',
            'hide', 'isRHS', 'hasMention', 'enableTimezone', 'currentUserId', 'currentTeamId', 'teamUrl', 'actions', 'isTeamAdmin',
            'isChannelAdmin', 'canManageAnyChannelMembersInCurrentTeam', 'intl'];
        const popoverProps: React.ComponentProps<typeof Popover> = Utils.deleteKeysFromObject({...this.props},
            keysToBeRemoved);
        const {formatMessage} = this.props.intl;
        const dataContent = [];
        const urlSrc = this.props.overwriteIcon ? this.props.overwriteIcon : this.props.src;
        dataContent.push(
            <div
                className='user-popover-image'
                key='user-popover-image'
            >
                <Avatar
                    size='xxl'
                    username={this.props.user?.username || ''}
                    url={urlSrc}
                />
                <StatusIcon
                    className='status user-popover-status'
                    status={this.props.hideStatus ? undefined : this.props.status}
                    button={true}
                />
            </div>,
        );
        const fullname = Utils.getFullName(this.props.user);
        const haveOverrideProp =
      this.props.overwriteIcon || this.props.overwriteName;
        if ((fullname || this.props.user.position) && !haveOverrideProp) {
            dataContent.push(
                <hr
                    key='user-popover-hr'
                    className='divider divider--expanded'
                />,
            );
        }
        if (fullname && !haveOverrideProp) {
            let sharedIcon;
            if (this.props.user.remote_id) {
                sharedIcon = (
                    <SharedUserIndicator
                        className='shared-user-icon'
                        withTooltip={true}
                    />
                );
            }
            dataContent.push(
                <div
                    data-testId={`popover-fullname-${this.props.user.username}`}
                    className='overflow--ellipsis text-nowrap'
                    key='user-popover-fullname'
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={<Tooltip id='fullNameTooltip'>{fullname}</Tooltip>}
                    >
                        <span className='user-profile-popover__heading'>{fullname}</span>
                    </OverlayTrigger>
                    {sharedIcon}
                </div>,
            );
        }
        if (this.props.user.is_bot && !haveOverrideProp) {
            dataContent.push(
                <div
                    key='bot-description'
                    className='overflow--ellipsis text-nowrap'
                >
                    {this.props.user.bot_description}
                </div>,
            );
        }
        if (this.props.user.position && !haveOverrideProp) {
            const position = (this.props.user?.position || '').substring(
                0,
                Constants.MAX_POSITION_LENGTH,
            );
            dataContent.push(
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={<Tooltip id='positionTooltip'>{position}</Tooltip>}
                    key='user-popover-position'
                >
                    <div className='overflow--ellipsis text-nowrap pt-1 pb-1'>
                        {position}
                    </div>
                </OverlayTrigger>,
            );
        }
        const email = this.props.user.email || '';
        if (email && !this.props.user.is_bot && !haveOverrideProp) {
            dataContent.push(
                <hr
                    key='user-popover-hr2'
                    className='divider divider--expanded'
                />,
            );
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    title={email}
                    key='user-popover-email'
                >
                    <a
                        href={'mailto:' + email}
                        className='text-nowrap text-lowercase user-popover__email pb-1'
                    >
                        {email}
                    </a>
                </div>,
            );
        }
        dataContent.push(
            <Pluggable
                key='profilePopoverPluggable2'
                pluggableName='PopoverUserAttributes'
                user={this.props.user}
                hide={this.props.hide}
                status={this.props.hideStatus ? null : this.props.status}
            />,
        );
        if (
            this.props.enableTimezone &&
      this.props.user.timezone &&
      !haveOverrideProp
        ) {
            dataContent.push(
                <div
                    key='user-popover-local-time'
                    className='pb-1'
                >
                    <span className='user-profile-popover__heading'>
                        <FormattedMessage
                            id='user_profile.account.localTime'
                            defaultMessage='Local Time'
                        />
                    </span>
                    <div>
                        <Timestamp
                            useRelative={false}
                            useDate={false}
                            userTimezone={this.props.user?.timezone as UserTimezone | undefined}
                            useTime={{
                                hour: 'numeric',
                                minute: 'numeric',
                                timeZoneName: 'short',
                            }}
                        />
                    </div>
                </div>,
            );
        }

        const customStatusAndExpiryContent = !haveOverrideProp && this.renderCustomStatus();
        if (customStatusAndExpiryContent) {
            const {customStatusContent, expiryContent} = customStatusAndExpiryContent;
            dataContent.push(
                <div
                    key='user-popover-status'
                    id='user-popover-status'
                    className='pb-1'
                >
                    <span className='user-profile-popover__heading'>
                        <FormattedMessage
                            id='user_profile.custom_status'
                            defaultMessage='Status'
                        />
                        {expiryContent}
                    </span>
                    {customStatusContent}
                </div>,
            );
        }
        if (this.props.user.id === this.props.currentUserId && !haveOverrideProp) {
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
                        <LocalizedIcon
                            className='fa fa-pencil-square-o'
                            title={{
                                id: t('generic_icons.edit'),
                                defaultMessage: 'Edit Icon',
                            }}
                        />
                        <FormattedMessage
                            id='user_profile.account.editProfile'
                            defaultMessage='Edit Profile'
                        />
                    </a>
                </div>,
            );
        }
        if (haveOverrideProp) {
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    key='user-popover-settings'
                    className='popover__row first'
                >
                    <FormattedMessage
                        id='user_profile.account.post_was_created'
                        defaultMessage='This post was created by an integration from'
                    />
                    <a
                        onClick={this.handleMentionKeyClick}
                    >{` @${this.props.user.username}`}</a>
                </div>,
            );
        }
        if (this.props.user.id !== this.props.currentUserId && !haveOverrideProp) {
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
                        <LocalizedIcon
                            className='fa fa-paper-plane'
                            title={{
                                id: t('user_profile.send.dm.icon'),
                                defaultMessage: 'Send Message Icon',
                            }}
                        />
                        <FormattedMessage
                            id='user_profile.send.dm'
                            defaultMessage='Send Message'
                        />
                    </a>
                </div>,
            );
            if (
                this.props.canManageAnyChannelMembersInCurrentTeam &&
        this.props.isInCurrentTeam
            ) {
                const addToChannelMessage = formatMessage({
                    id: 'user_profile.add_user_to_channel',
                    defaultMessage: 'Add to a Channel',
                });
                dataContent.push(
                    <div
                        data-toggle='tooltip'
                        className='popover__row first'
                        key='user-popover-add-to-channel'
                    >
                        <a
                            href='#'
                            className='text-nowrap'
                            onClick={this.handleAddToChannel}
                        >
                            <ToggleModalButtonRedux
                                accessibilityLabel={addToChannelMessage}
                                modalId={ModalIdentifiers.ADD_USER_TO_CHANNEL}
                                role='menuitem'
                                dialogType={AddUserToChannelModal}
                                dialogProps={{user: this.props.user}}
                                onClick={this.props.hide}
                            >
                                <LocalizedIcon
                                    className='fa fa-user-plus'
                                    title={{
                                        id: t('user_profile.add_user_to_channel.icon'),
                                        defaultMessage: 'Add User to Channel Icon',
                                    }}
                                />
                                {addToChannelMessage}
                            </ToggleModalButtonRedux>
                        </a>
                    </div>,
                );
            }
        }
        dataContent.push(
            <Pluggable
                key='profilePopoverPluggable3'
                pluggableName='PopoverUserActions'
                user={this.props.user}
                hide={this.props.hide}
                status={this.props.hideStatus ? null : this.props.status}
            />,
        );
        let roleTitle;
        if (this.props.user.is_bot) {
            roleTitle = (
                <span className='user-popover__role'>
                    {Utils.localizeMessage('bots.is_bot', 'BOT')}
                </span>
            );
        } else if (Utils.isGuest(this.props.user)) {
            roleTitle = (
                <span className='user-popover__role'>
                    {Utils.localizeMessage('post_info.guest', 'GUEST')}
                </span>
            );
        } else if (Utils.isSystemAdmin(this.props.user.roles)) {
            roleTitle = (
                <span className='user-popover__role'>
                    {Utils.localizeMessage(
                        'admin.permissions.roles.system_admin.name',
                        'System Admin',
                    )}
                </span>
            );
        } else if (this.props.isTeamAdmin) {
            roleTitle = (
                <span className='user-popover__role'>
                    {Utils.localizeMessage(
                        'admin.permissions.roles.team_admin.name',
                        'Team Admin',
                    )}
                </span>
            );
        } else if (this.props.isChannelAdmin) {
            roleTitle = (
                <span className='user-popover__role'>
                    {Utils.localizeMessage(
                        'admin.permissions.roles.channel_admin.name',
                        'Channel Admin',
                    )}
                </span>
            );
        }
        let title: React.ReactNode = `@${this.props.user.username}`;
        if (this.props.overwriteName) {
            title = this.props.overwriteName;
            roleTitle = '';
        } else if (this.props.hasMention) {
            title = <a onClick={this.handleMentionKeyClick}>{title}</a>;
        }
        title = (
            <span data-testid={`profilePopoverTitle_${this.props.user.username}`}>
                <span className='user-popover__username'>{title}</span>
                {roleTitle}
            </span>
        );
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

export default injectIntl(ProfilePopover);
