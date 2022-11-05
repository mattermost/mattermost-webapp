// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import classNames from 'classnames';

import {AccountOutlineIcon, AccountPlusOutlineIcon, CloseIcon, EmoticonHappyOutlineIcon, PhoneInTalkIcon, SendIcon} from '@mattermost/compass-icons/components';

import Pluggable from 'plugins/pluggable';
import CallButton from 'plugins/call_button';

import EventEmitter from 'mattermost-redux/utils/event_emitter';
import {isGuest, isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import * as GlobalActions from 'actions/global_actions';

import {UserCustomStatus, UserProfile, UserTimezone, CustomStatusDuration} from '@mattermost/types/users';
import {ServerError} from '@mattermost/types/errors';
import {ModalData} from 'types/actions';

import {getHistory} from 'utils/browser_history';
import Constants, {ModalIdentifiers, UserStatuses} from 'utils/constants';
import {t} from 'utils/i18n';
import * as Utils from 'utils/utils';

import StatusIcon from 'components/status_icon';
import Timestamp from 'components/timestamp';
import UserSettingsModal from 'components/user_settings/modal';
import AddUserToChannelModal from 'components/add_user_to_channel_modal';
import ToggleModalButton from 'components/toggle_modal_button';
import Avatar from 'components/widgets/users/avatar';
import Popover from 'components/widgets/popover';
import SharedUserIndicator from 'components/shared_user_indicator';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import CustomStatusModal from 'components/custom_status/custom_status_modal';
import CustomStatusText from 'components/custom_status/custom_status_text';
import ExpiryTime from 'components/custom_status/expiry_time';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import './profile_popover.scss';

// todo sinan fix unit and e2e tests
// todo sinan fix close button
interface ProfilePopoverProps extends Omit<React.ComponentProps<typeof Popover>, 'id'> {

    /**
     * Source URL from the image to display in the popover
     */
    src: string;

    /**
     * Source URL from the image that should override default image
     */
    overwriteIcon?: string;

    /**
     * Set to true of the popover was opened from a webhook post
     */
    fromWebhook?: boolean;

    /**
     * User the popover is being opened for
     */
    user?: UserProfile;
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
    isMobileView: boolean;

    /**
     * Returns state of modals in redux for determing which need to be closed
     */
    modals?: {
        modalState: {
            [modalId: string]: {
                open: boolean;
                dialogProps: Record<string, any>;
                dialogType: React.ComponentType;
            };
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
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (modalId: string) => void;
        openDirectChannelToUserId: (userId?: string) => Promise<{ error: ServerError }>;
        getMembershipForEntities: (teamId: string, userId: string, channelId?: string) => Promise<void>;
    };
    intl: IntlShape;

    lastActivityTimestamp: number;

    enableLastActiveTime: boolean;

    timestampUnits: string[];

    isCallsEnabled: boolean;
}
type ProfilePopoverState = {
    loadingDMChannel?: string;
};

/**
 * The profile popover, or hovercard, that appears with user information when clicking
 * on the username or profile picture of a user.
 */
class ProfilePopover extends React.PureComponent<ProfilePopoverProps, ProfilePopoverState> {
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
    handleShowDirectChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
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
        actions.openDirectChannelToUserId(user.id).then((result: { error: ServerError }) => {
            if (!result.error) {
                if (this.props.isMobileView) {
                    GlobalActions.emitCloseRightHandSide();
                }
                this.setState({loadingDMChannel: undefined});
                if (this.props.hide) {
                    this.props.hide();
                }
                getHistory().push(`${this.props.teamUrl}/messages/@${user.username}`);
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
    handleEditAccountSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    handleAddToChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        this.handleCloseModals();
    };
    handleCloseModals = () => {
        const {modals} = this.props;
        for (const modal in modals?.modalState) {
            if (!Object.prototype.hasOwnProperty.call(modals, modal)) {
                continue;
            }
            if (modals?.modalState[modal].open) {
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
                <CustomStatusEmoji
                    userID={this.props.user?.id}
                    showTooltip={false}
                    emojiStyle={{
                        marginRight: 4,
                        marginTop: 1,
                    }}
                />
            );
            customStatusContent = (
                <div className='d-flex align-items-center'>
                    {customStatusEmoji}
                    <CustomStatusText
                        tooltipDirection='top'
                        text={customStatus?.text || ''}
                        className='user-popover__email'
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
                <button
                    className='user-popover__set-custom-status-btn'
                    onClick={this.showCustomStatusModal}
                >
                    <EmoticonHappyOutlineIcon size={14}/>
                    <FormattedMessage
                        id='user_profile.custom_status.set_status'
                        defaultMessage='Set a status'
                    />
                </button>
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
                    id='userAvatar'
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
        if (this.props.enableLastActiveTime && this.props.lastActivityTimestamp && this.props.timestampUnits) {
            dataContent.push(
                <div
                    className='user-popover-last-active'
                    key='user-popover-last-active'
                >
                    <FormattedMessage
                        id='channel_header.lastActive'
                        defaultMessage='Last online {timestamp}'
                        values={{
                            timestamp: (
                                <Timestamp
                                    value={this.props.lastActivityTimestamp}
                                    units={this.props.timestampUnits}
                                    useTime={false}
                                    style={'short'}
                                />
                            ),
                        }}
                    />
                </div>,
            );
        }

        const fullname = Utils.getFullName(this.props.user);
        const haveOverrideProp = this.props.overwriteIcon || this.props.overwriteName;
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
                    className='overflow--ellipsis text-nowrap pb-1'
                    key='user-popover-fullname'
                >
                    <span className='user-profile-popover__heading'>{fullname}</span>
                    {sharedIcon}
                </div>,
            );
        }
        if (this.props.user.is_bot && !haveOverrideProp) {
            dataContent.push(
                <div
                    key='bot-description'
                    className='overflow--ellipsis text-nowrap pb-1'
                >
                    {this.props.user.bot_description}
                </div>,
            );
        }
        const userNameClass = classNames('overflow--ellipsis text-nowrap pb-1', {'user-profile-popover__heading': fullname === ''});
        const userName: React.ReactNode = `@${this.props.user.username}`;
        dataContent.push(
            <div className={userNameClass}>
                {userName}
            </div>,
        );
        if (this.props.user.position && !haveOverrideProp) {
            const position = (this.props.user?.position || '').substring(
                0,
                Constants.MAX_POSITION_LENGTH,
            );
            dataContent.push(
                <div className='overflow--ellipsis text-nowrap pb-1'>
                    {position}
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
                fromWebhook={this.props.fromWebhook}
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
                    className='pb-1 d-flex flex-column'
                >
                    <span className='user-popover__subtitle' >
                        <FormattedMessage
                            id='user_profile.account.localTime'
                            defaultMessage='Local Time'
                        />
                    </span>
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
                    className='pb-1 d-flex flex-column'
                >
                    <span className='user-popover__subtitle'>
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
        const sendMessageTooltip = (
            <Tooltip id='sendMessageTooltip'>
                <FormattedMessage
                    id='channel_members_rhs.member.send_message'
                    defaultMessage='Send message'
                />
            </Tooltip>
        );
        if (this.props.user.id === this.props.currentUserId && !haveOverrideProp) {
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    key='user-popover-settings'
                    className='popover__row first'
                >
                    <button
                        type='button'
                        className='btn'
                        onClick={this.handleEditAccountSettings}
                    >
                        <AccountOutlineIcon
                            size={12}
                            aria-label={{
                                id: t('generic_icons.edit'),
                                defaultMessage: 'Edit Icon',
                            }}
                        />
                        <FormattedMessage
                            id='user_profile.account.editProfile'
                            defaultMessage='Edit Profile'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn icon-btn'
                        onClick={this.handleShowDirectChannel}
                    >
                        <OverlayTrigger
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={sendMessageTooltip}
                        >
                            <SendIcon
                                size={18}
                                aria-label={formatMessage({
                                    id: t('user_profile.send.dm.icon'),
                                    defaultMessage: 'Send Message Icon',
                                })}
                            />
                        </OverlayTrigger>
                    </button>
                </div>,
            );
        }
        if (haveOverrideProp) { // todo sinan test what is this. If not needed delete this and handleMentionKeyClick
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
        const addToChannelMessage = formatMessage({
            id: 'user_profile.add_user_to_channel',
            defaultMessage: 'Add to a Channel',
        });

        // todo sinan tooltip koy
        const addToChannelButton = (
            <button
                type='button'
                className='btn icon-btn'
                onClick={this.handleAddToChannel}
            >
                <ToggleModalButton
                    ariaLabel={addToChannelMessage}
                    modalId={ModalIdentifiers.ADD_USER_TO_CHANNEL}
                    role='menuitem'
                    dialogType={AddUserToChannelModal}
                    dialogProps={{user: this.props.user}}
                    onClick={this.props.hide}
                >
                    <AccountPlusOutlineIcon
                        size={18}
                        aria-label={formatMessage({
                            id: t('user_profile.add_user_to_channel.icon'),
                            defaultMessage: 'Add User to Channel Icon',
                        })}
                    />
                </ToggleModalButton>
            </button>
        );

        // todo sinan tooltip koy
        const callButton = (
            <button
                type='button'
                className='btn icon-btn'
            >
                <PhoneInTalkIcon
                    size={18}
                    aria-label={formatMessage({
                        id: t('webapp.mattermost.feature.start_call'),
                        defaultMessage: 'Start Call',
                    })}
                />
            </button>
        );
        if (this.props.user.id !== this.props.currentUserId && !haveOverrideProp) {
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    key='user-popover-dm'
                    className='popover__row first'
                >
                    <button
                        type='button'
                        className='btn'
                        onClick={this.handleShowDirectChannel}
                    >
                        <SendIcon
                            size={12}
                            aria-label={formatMessage({
                                id: t('user_profile.send.dm.icon'),
                                defaultMessage: 'Send Message Icon',
                            })}
                        />
                        <FormattedMessage
                            id='user_profile.send.dm'
                            defaultMessage='Message'
                        />
                    </button>
                    <div
                        className='popover_row-controlContainer'
                    >
                        {(this.props.canManageAnyChannelMembersInCurrentTeam && this.props.isInCurrentTeam) ? addToChannelButton : null}
                        {this.props.isCallsEnabled ? <CallButton customButton={callButton}/> : null}
                    </div>
                </div>,
            );
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
        } else if (isGuest(this.props.user.roles)) {
            roleTitle = (
                <span className='user-popover__role'>
                    {Utils.localizeMessage('post_info.guest', 'GUEST')}
                </span>
            );
        } else if (isSystemAdmin(this.props.user.roles)) {
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
        const title = (
            <span data-testid={`profilePopoverTitle_${this.props.user.username}`}>
                {roleTitle}
                <button
                    className='user-popover__close'
                    onClick={this.handleCloseModals}
                >
                    <CloseIcon
                        size={18}
                    />
                </button>
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
