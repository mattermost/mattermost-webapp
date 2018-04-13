// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import 'bootstrap';

import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebrtcActions from 'actions/webrtc_actions.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';

import MessageWrapper from 'components/message_wrapper.jsx';
import {Constants, NotificationLevels, RHSStates, UserStatuses, ModalIdentifiers} from 'utils/constants.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import {getSiteURL} from 'utils/url.jsx';
import * as Utils from 'utils/utils.jsx';
import {messageHtmlToComponent} from 'utils/post_utils.jsx';
import ChannelInfoModal from 'components/channel_info_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal';
import ChannelNotificationsModal from 'components/channel_notifications_modal';
import DeleteChannelModal from 'components/delete_channel_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import PopoverListMembers from 'components/popover_list_members';
import RenameChannelModal from 'components/rename_channel_modal';
import SearchBar from 'components/search_bar';
import StatusIcon from 'components/status_icon.jsx';
import FlagIcon from 'components/svg/flag_icon';
import MentionsIcon from 'components/svg/mentions_icon';
import PinIcon from 'components/svg/pin_icon';
import SearchIcon from 'components/svg/search_icon';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

import Pluggable from 'plugins/pluggable';

import HeaderIconWrapper from './components/header_icon_wrapper';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;
const SEARCH_BAR_MINIMUM_WINDOW_SIZE = 1140;

export default class ChannelHeader extends React.Component {
    static propTypes = {
        actions: PropTypes.shape({
            leaveChannel: PropTypes.func.isRequired,
            favoriteChannel: PropTypes.func.isRequired,
            unfavoriteChannel: PropTypes.func.isRequired,
            showFlaggedPosts: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
            showMentions: PropTypes.func.isRequired,
            closeRightHandSide: PropTypes.func.isRequired,
            updateRhsState: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
            getCustomEmojisInText: PropTypes.func.isRequired,
            updateChannelNotifyProps: PropTypes.func.isRequired,
        }).isRequired,
        channel: PropTypes.object.isRequired,
        channelMember: PropTypes.object.isRequired,
        isFavorite: PropTypes.bool,
        isDefault: PropTypes.bool,
        currentUser: PropTypes.object.isRequired,
        dmUser: PropTypes.object,
        dmUserStatus: PropTypes.object,
        dmUserIsInCall: PropTypes.bool,
        enableFormatting: PropTypes.bool.isRequired,
        isReadOnly: PropTypes.bool,
        rhsState: PropTypes.oneOf(
            Object.values(RHSStates)
        ),
        enableWebrtc: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        dmUser: {},
        dmUserStatus: {status: UserStatuses.OFFLINE},
    };

    constructor(props) {
        super(props);

        const showSearchBar = Utils.windowWidth() > SEARCH_BAR_MINIMUM_WINDOW_SIZE;
        this.state = {
            showSearchBar,
            showEditChannelHeaderModal: false,
            showEditChannelPurposeModal: false,
            showMembersModal: false,
            showRenameChannelModal: false,
            showChannelNotificationsModal: false,
            isBusy: WebrtcStore.isBusy(),
        };
    }

    componentDidMount() {
        this.props.actions.getCustomEmojisInText(this.props.channel.header);
        WebrtcStore.addChangedListener(this.onWebrtcChange);
        WebrtcStore.addBusyListener(this.onBusy);
        document.addEventListener('keydown', this.handleShortcut);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        WebrtcStore.removeChangedListener(this.onWebrtcChange);
        WebrtcStore.removeBusyListener(this.onBusy);
        document.removeEventListener('keydown', this.handleShortcut);
        window.removeEventListener('resize', this.handleResize);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.channel.id !== nextProps.channel.id) {
            this.props.actions.getCustomEmojisInText(nextProps.channel.header);
        }
    }

    handleResize = () => {
        const windowWidth = Utils.windowWidth();

        this.setState({showSearchBar: windowWidth > SEARCH_BAR_MINIMUM_WINDOW_SIZE});
    };

    onWebrtcChange = () => {
        this.setState({isBusy: WebrtcStore.isBusy()});
    };

    onBusy = (isBusy) => {
        this.setState({isBusy});
    };

    handleLeave = () => {
        if (this.props.channel.type === Constants.PRIVATE_CHANNEL) {
            GlobalActions.showLeavePrivateChannelModal(this.props.channel);
        } else {
            this.props.actions.leaveChannel(this.props.channel.id);
        }
    };

    toggleFavorite = () => {
        if (this.props.isFavorite) {
            this.props.actions.unfavoriteChannel(this.props.channel.id);
        } else {
            this.props.actions.favoriteChannel(this.props.channel.id);
        }
    };

    unmute = () => {
        const {actions, channel, channelMember, currentUser} = this.props;

        if (!channelMember || !currentUser || !channel) {
            return;
        }

        const options = {mark_unread: NotificationLevels.ALL};
        actions.updateChannelNotifyProps(currentUser.id, channel.id, options);
    };

    searchMentions = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.MENTION) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showMentions();
        }
    };

    getPinnedPosts = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.PIN) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showPinnedPosts();
        }
    };

    getFlagged = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.FLAG) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showFlaggedPosts();
        }
    };

    searchButtonClick = (e) => {
        e.preventDefault();
        this.props.actions.updateRhsState(RHSStates.SEARCH);
    };

    handleShortcut = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                this.searchMentions(e);
            }
        }
    };

    showRenameChannelModal = (e) => {
        e.preventDefault();

        this.setState({
            showRenameChannelModal: true,
        });
    };

    hideRenameChannelModal = () => {
        this.setState({
            showRenameChannelModal: false,
        });
    };

    showChannelNotificationsModal = (e) => {
        e.preventDefault();

        this.setState({
            showChannelNotificationsModal: true,
        });
    };

    hideChannelNotificationsModal = () => {
        this.setState({
            showChannelNotificationsModal: false,
        });
    };

    initWebrtc = (contactId, isOnline) => {
        if (isOnline && !this.state.isBusy) {
            this.props.actions.closeRightHandSide();
            WebrtcActions.initWebrtc(contactId, true);
        }
    };

    handleOnMouseOver = () => {
        if (this.refs.headerOverlay) {
            this.refs.headerOverlay.show();
        }
    };

    handleOnMouseOut = () => {
        if (this.refs.headerOverlay) {
            this.refs.headerOverlay.hide();
        }
    };

    showMembersModal = () => {
        this.setState({showMembersModal: true});
    };

    hideMembersModal = () => {
        this.setState({showMembersModal: false});
    };

    showEditChannelPurposeModal = () => {
        this.setState({showEditChannelPurposeModal: true});
    };

    hideEditChannelPurposeModal = () => {
        this.setState({showEditChannelPurposeModal: false});
    };

    hideEditChannelHeaderModal = () => {
        this.setState({showEditChannelHeaderModal: false});
    };

    showEditChannelHeaderModal = () => {
        this.setState({showEditChannelHeaderModal: true});
    };

    handleWebRTCOnClick = (e) => {
        e.preventDefault();
        const dmUserId = this.props.dmUser.id;
        const dmUserStatus = this.props.dmUserStatus.status;
        const isOffline = dmUserStatus === UserStatuses.OFFLINE;
        const isDoNotDisturb = dmUserStatus === UserStatuses.DND;

        this.initWebrtc(dmUserId, !isOffline || !isDoNotDisturb);
    };

    showInviteModal = () => {
        const {channel, currentUser, actions} = this.props;
        const inviteModalData = {
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel, currentUser},
        };

        actions.openModal(inviteModalData);
    };

    render() {
        if (Utils.isEmptyObject(this.props.channel) ||
                Utils.isEmptyObject(this.props.channelMember) ||
                Utils.isEmptyObject(this.props.currentUser)) {
            // Use an empty div to make sure the header's height stays constant
            return (
                <div className='channel-header'/>
            );
        }

        const channel = this.props.channel;

        const textFormattingOptions = {singleline: true, mentionHighlight: false, siteURL: getSiteURL(), channelNamesMap: ChannelStore.getChannelNamesMap(), team: TeamStore.getCurrent(), atMentions: true};
        const popoverContent = (
            <Popover
                id='header-popover'
                bStyle='info'
                bSize='large'
                placement='bottom'
                className='description'
                onMouseOver={this.handleOnMouseOver}
                onMouseOut={this.handleOnMouseOut}
            >
                <MessageWrapper
                    message={channel.header}
                    options={textFormattingOptions}
                />
            </Popover>
        );

        let channelTitle = channel.display_name;
        const isDirect = (this.props.channel.type === Constants.DM_CHANNEL);
        const isGroup = (this.props.channel.type === Constants.GM_CHANNEL);
        const isPrivate = (this.props.channel.type === Constants.PRIVATE_CHANNEL);
        const teamId = TeamStore.getCurrentId();
        let webrtc;

        if (isDirect) {
            const userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            const dmUserStatus = this.props.dmUserStatus.status;

            const teammateId = Utils.getUserIdFromChannelName(channel);
            if (this.props.currentUser.id === teammateId) {
                channelTitle = (
                    <FormattedMessage
                        id='channel_header.directchannel.you'
                        defaultMessage='{displayname} (you) '
                        values={{
                            displayname: Utils.getDisplayNameByUserId(teammateId),
                        }}
                    />
                );
            } else {
                channelTitle = Utils.getDisplayNameByUserId(teammateId) + ' ';
            }

            const webrtcEnabled = this.props.enableWebrtc && userMedia && Utils.isFeatureEnabled(PreReleaseFeatures.WEBRTC_PREVIEW);

            if (webrtcEnabled && this.props.currentUser.id !== teammateId) {
                const isOffline = dmUserStatus === UserStatuses.OFFLINE;
                const isDoNotDisturb = dmUserStatus === UserStatuses.DND;
                const busy = this.props.dmUserIsInCall;
                let circleClass = '';
                let webrtcMessage;

                if (isOffline || isDoNotDisturb || busy) {
                    circleClass = 'offline';

                    if (isOffline) {
                        webrtcMessage = (
                            <FormattedMessage
                                id='channel_header.webrtc.offline'
                                defaultMessage='The user is offline'
                            />
                        );
                    } else if (isDoNotDisturb) {
                        webrtcMessage = (
                            <FormattedMessage
                                id='channel_header.webrtc.doNotDisturb'
                                defaultMessage='Do not disturb'
                            />
                        );
                    } else if (busy) {
                        webrtcMessage = (
                            <FormattedMessage
                                id='channel_header.webrtc.unavailable'
                                defaultMessage='New call unavailable until your existing call ends'
                            />
                        );
                    }
                } else {
                    webrtcMessage = (
                        <FormattedMessage
                            id='channel_header.webrtc.call'
                            defaultMessage='Start Video Call'
                        />
                    );
                }

                const webrtcTooltip = (
                    <Tooltip id='webrtcTooltip'>{webrtcMessage}</Tooltip>
                );

                webrtc = (
                    <div className={'webrtc__header channel-header__icon wide text ' + circleClass}>
                        <button
                            className='style--none'
                            onClick={this.handleWebRTCOnClick}
                            disabled={isOffline || isDoNotDisturb}
                        >
                            <OverlayTrigger
                                trigger={['hover', 'focus']}
                                delayShow={Constants.WEBRTC_TIME_DELAY}
                                placement='bottom'
                                overlay={webrtcTooltip}
                            >
                                <div
                                    id='webrtc-btn'
                                    className={'webrtc__button ' + circleClass}
                                >
                                    {'WebRTC'}
                                </div>
                            </OverlayTrigger>
                        </button>
                    </div>
                );
            }
        }

        let popoverListMembers;
        if (!isDirect) {
            popoverListMembers = (
                <PopoverListMembers
                    channel={channel}
                />
            );
        }

        const dropdownContents = [];
        if (isDirect) {
            dropdownContents.push(
                <li
                    key='edit_header_direct'
                    role='presentation'
                >
                    <ToggleModalButtonRedux
                        id='channelEditHeaderDirect'
                        role='menuitem'
                        modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
                        dialogType={EditChannelHeaderModal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='channel_header.channelHeader'
                            defaultMessage='Edit Channel Header'
                        />
                    </ToggleModalButtonRedux>
                </li>
            );
        } else if (isGroup) {
            dropdownContents.push(
                <li
                    key='edit_header_direct'
                    role='presentation'
                >
                    <ToggleModalButtonRedux
                        id='channelEditHeaderGroup'
                        role='menuitem'
                        modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
                        dialogType={EditChannelHeaderModal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='channel_header.channelHeader'
                            defaultMessage='Edit Channel Header'
                        />
                    </ToggleModalButtonRedux>
                </li>
            );

            dropdownContents.push(
                <li
                    key='notification_preferences'
                    role='presentation'
                >
                    <button
                        className='style--none'
                        id='channelNotificationsGroup'
                        role='menuitem'
                        onClick={this.showChannelNotificationsModal}
                    >
                        <FormattedMessage
                            id='channel_header.notificationPreferences'
                            defaultMessage='Notification Preferences'
                        />
                    </button>
                </li>
            );

            dropdownContents.push(
                <li
                    key='add_members'
                    role='presentation'
                >
                    <ToggleModalButtonRedux
                        id='channelAddMembersGroup'
                        role='menuitem'
                        modalId={ModalIdentifiers.CREATE_DM_CHANNEL}
                        dialogType={MoreDirectChannels}
                        dialogProps={{isExistingChannel: true}}
                    >
                        <FormattedMessage
                            id='channel_header.addMembers'
                            defaultMessage='Add Members'
                        />
                    </ToggleModalButtonRedux>
                </li>
            );
        } else {
            dropdownContents.push(
                <li
                    key='view_info'
                    role='presentation'
                >
                    <ToggleModalButtonRedux
                        id='channelViewInfo'
                        role='menuitem'
                        modalId={ModalIdentifiers.CHANNEL_INFO}
                        dialogType={ChannelInfoModal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='channel_header.viewInfo'
                            defaultMessage='View Info'
                        />
                    </ToggleModalButtonRedux>
                </li>
            );

            if (this.props.isDefault) {
                dropdownContents.push(
                    <li
                        key='manage_members'
                        role='presentation'
                    >
                        <button
                            className='style--none'
                            id='channelManageMembers'
                            role='menuitem'
                            onClick={this.showMembersModal}
                        >
                            <FormattedMessage
                                id='channel_header.viewMembers'
                                defaultMessage='View Members'
                            />
                        </button>
                    </li>
                );
            }

            dropdownContents.push(
                <li
                    key='notification_preferences'
                    role='presentation'
                >
                    <button
                        className='style--none'
                        id='channelNotificationsGroup'
                        role='menuitem'
                        onClick={this.showChannelNotificationsModal}
                    >
                        <FormattedMessage
                            id='channel_header.notificationPreferences'
                            defaultMessage='Notification Preferences'
                        />
                    </button>
                </li>
            );

            if (!this.props.isDefault) {
                dropdownContents.push(
                    <li
                        key='divider-1'
                        className='divider'
                    />
                );

                dropdownContents.push(
                    <ChannelPermissionGate
                        channelId={channel.id}
                        teamId={teamId}
                        permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                        key='add_members_permission'
                    >
                        <li
                            key='add_members'
                            role='presentation'
                        >
                            <ToggleModalButtonRedux
                                id='channelAddMembers'
                                ref='channelInviteModalButton'
                                role='menuitem'
                                modalId={ModalIdentifiers.CHANNEL_INVITE}
                                dialogType={ChannelInviteModal}
                                dialogProps={{channel, currentUser: this.props.currentUser}}
                            >
                                <FormattedMessage
                                    id='channel_header.addMembers'
                                    defaultMessage='Add Members'
                                />
                            </ToggleModalButtonRedux>
                        </li>
                    </ChannelPermissionGate>
                );
                dropdownContents.push(
                    <ChannelPermissionGate
                        channelId={channel.id}
                        teamId={teamId}
                        permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                        key='manage_members_permission'
                    >
                        <li
                            key='manage_members'
                            role='presentation'
                        >
                            <button
                                className='style--none'
                                id='channelManageMembers'
                                role='menuitem'
                                onClick={this.showMembersModal}
                            >
                                <FormattedMessage
                                    id='channel_header.manageMembers'
                                    defaultMessage='Manage Members'
                                />
                            </button>
                        </li>
                    </ChannelPermissionGate>
                );

                dropdownContents.push(
                    <ChannelPermissionGate
                        channelId={channel.id}
                        teamId={teamId}
                        permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                        invert={true}
                        key='view_members_permission'
                    >
                        <li
                            key='view_members'
                            role='presentation'
                        >
                            <button
                                className='style--none'
                                id='channelViewMembers'
                                role='menuitem'
                                onClick={this.showMembersModal}
                            >
                                <FormattedMessage
                                    id='channel_header.viewMembers'
                                    defaultMessage='View Members'
                                />
                            </button>
                        </li>
                    </ChannelPermissionGate>
                );
            }

            if (!this.props.isReadOnly) {
                dropdownContents.push(
                    <ChannelPermissionGate
                        channelId={channel.id}
                        teamId={teamId}
                        permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        key='set_channel_info_permission'
                    >
                        <li
                            key='divider-2'
                            className='divider'
                        />

                        <li
                            key='set_channel_header'
                            role='presentation'
                        >
                            <ToggleModalButtonRedux
                                id='channelEditHeader'
                                role='menuitem'
                                modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
                                dialogType={EditChannelHeaderModal}
                                dialogProps={{channel}}
                            >
                                <FormattedMessage
                                    id='channel_header.setHeader'
                                    defaultMessage='Edit Channel Header'
                                />
                            </ToggleModalButtonRedux>
                        </li>

                        <li
                            key='set_channel_purpose'
                            role='presentation'
                        >
                            <button
                                className='style--none'
                                id='channelEditPurpose'
                                role='menuitem'
                                onClick={this.showEditChannelPurposeModal}
                            >
                                <FormattedMessage
                                    id='channel_header.setPurpose'
                                    defaultMessage='Edit Channel Purpose'
                                />
                            </button>
                        </li>

                        <li
                            key='rename_channel'
                            role='presentation'
                        >
                            <button
                                className='style--none'
                                id='channelRename'
                                role='menuitem'
                                onClick={this.showRenameChannelModal}
                            >
                                <FormattedMessage
                                    id='channel_header.rename'
                                    defaultMessage='Rename Channel'
                                />
                            </button>
                        </li>
                    </ChannelPermissionGate>
                );
            }

            if (!this.props.isDefault) {
                dropdownContents.push(
                    <ChannelPermissionGate
                        channelId={channel.id}
                        teamId={teamId}
                        permissions={[isPrivate ? Permissions.DELETE_PRIVATE_CHANNEL : Permissions.DELETE_PUBLIC_CHANNEL]}
                        key='delete_channel_permission'
                    >
                        <li
                            key='delete_channel'
                            role='presentation'
                        >
                            <ToggleModalButtonRedux
                                id='channelDelete'
                                role='menuitem'
                                modalId={ModalIdentifiers.DELETE_CHANNEL}
                                dialogType={DeleteChannelModal}
                                dialogProps={{channel}}
                            >
                                <FormattedMessage
                                    id='channel_header.delete'
                                    defaultMessage='Delete Channel'
                                />
                            </ToggleModalButtonRedux>
                        </li>
                    </ChannelPermissionGate>
                );

                dropdownContents.push(
                    <li
                        key='divider-3'
                        className='divider'
                    />
                );

                dropdownContents.push(
                    <li
                        key='leave_channel'
                        role='presentation'
                    >
                        <button
                            className='style--none'
                            id='channelLeave'
                            role='menuitem'
                            onClick={this.handleLeave}
                        >
                            <FormattedMessage
                                id='channel_header.leave'
                                defaultMessage='Leave Channel'
                            />
                        </button>
                    </li>
                );
            }
        }

        let dmHeaderIconStatus;
        let dmHeaderTextStatus;
        if (channel.type === Constants.DM_CHANNEL && !this.props.dmUser.delete_at) {
            dmHeaderIconStatus = (
                <StatusIcon
                    type='avatar'
                    status={channel.status}
                />
            );

            dmHeaderTextStatus = (
                <span className='header-status__text'>
                    <FormattedMessage
                        id={`status_dropdown.set_${channel.status}`}
                        defaultMessage={Utils.toTitleCase(channel.status)}
                    />
                </span>
            );
        }

        let headerTextContainer;
        if (channel.header) {
            let headerTextElement;
            const formattedText = TextFormatting.formatText(channel.header, textFormattingOptions);
            if (this.props.enableFormatting) {
                headerTextElement = (
                    <div
                        id='channelHeaderDescription'
                        className='channel-header__description'
                    >
                        {dmHeaderIconStatus}
                        {dmHeaderTextStatus}
                        <span onClick={Utils.handleFormattedTextClick}>
                            {messageHtmlToComponent(formattedText, false, {mentions: false})}
                        </span>
                    </div>
                );
            } else {
                headerTextElement = (
                    <div
                        id='channelHeaderDescription'
                        onClick={Utils.handleFormattedTextClick}
                        className='channel-header__description light'
                    >
                        {dmHeaderIconStatus}
                        {dmHeaderTextStatus}
                        {channel.header}
                    </div>
                );
            }

            headerTextContainer = (
                <OverlayTrigger
                    trigger={'click'}
                    placement='bottom'
                    rootClose={true}
                    overlay={popoverContent}
                    ref='headerOverlay'
                >
                    {headerTextElement}
                </OverlayTrigger>
            );
        } else {
            let editMessage;
            if (!this.props.isReadOnly) {
                if (isDirect || isGroup) {
                    editMessage = (
                        <button
                            className='style--none'
                            onClick={this.showEditChannelHeaderModal}
                        >
                            <FormattedMessage
                                id='channel_header.addChannelHeader'
                                defaultMessage='Add a channel description'
                            />
                        </button>
                    );
                } else {
                    editMessage = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <button
                                className='style--none'
                                onClick={this.showEditChannelHeaderModal}
                            >
                                <FormattedMessage
                                    id='channel_header.addChannelHeader'
                                    defaultMessage='Add a channel description'
                                />
                            </button>
                        </ChannelPermissionGate>
                    );
                }
            }
            headerTextContainer = (
                <div
                    id='channelHeaderDescription'
                    className='channel-header__description light'
                >
                    {dmHeaderIconStatus}
                    {dmHeaderTextStatus}
                    {editMessage}
                </div>
            );
        }

        let editHeaderModal;
        if (this.state.showEditChannelHeaderModal) {
            editHeaderModal = (
                <EditChannelHeaderModal
                    onHide={this.hideEditChannelHeaderModal}
                    channel={channel}
                />
            );
        }

        let toggleFavoriteTooltip;
        if (this.props.isFavorite) {
            toggleFavoriteTooltip = (
                <Tooltip id='favoriteTooltip'>
                    <FormattedMessage
                        id='channelHeader.removeFromFavorites'
                        defaultMessage='Remove from Favorites'
                    />
                </Tooltip>
            );
        } else {
            toggleFavoriteTooltip = (
                <Tooltip id='favoriteTooltip'>
                    <FormattedMessage
                        id='channelHeader.addToFavorites'
                        defaultMessage='Add to Favorites'
                    />
                </Tooltip>
            );
        }

        const toggleFavorite = (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                overlay={toggleFavoriteTooltip}
            >
                <button
                    id='toggleFavorite'
                    onClick={this.toggleFavorite}
                    className={'style--none color--link channel-header__favorites ' + (this.props.isFavorite ? 'active' : 'inactive')}
                >
                    <i className={'icon fa ' + (this.props.isFavorite ? 'fa-star' : 'fa-star-o')}/>
                </button>
            </OverlayTrigger>
        );

        const channelMuted = isChannelMuted(this.props.channelMember);
        const channelMutedTooltip = (
            <Tooltip id='channelMutedTooltip'>
                <FormattedMessage
                    id='channelHeader.unmute'
                    defaultMessage='Unmute'
                />
            </Tooltip>
        );

        let muteTrigger;
        if (channelMuted) {
            muteTrigger = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={channelMutedTooltip}
                >
                    <button
                        id='toggleMute'
                        onClick={this.unmute}
                        className={'style--none color--link channel-header__mute inactive'}
                    >
                        <i className={'icon fa fa-bell-slash-o'}/>
                    </button>
                </OverlayTrigger>
            );
        }

        let channelMembersModal;
        if (this.state.showMembersModal) {
            channelMembersModal = (
                <ChannelMembersModal
                    onModalDismissed={this.hideMembersModal}
                    showInviteModal={this.showInviteModal}
                    channel={channel}
                />
            );
        }

        let editPurposeModal;
        if (this.state.showEditChannelPurposeModal) {
            editPurposeModal = (
                <EditChannelPurposeModal
                    onModalDismissed={this.hideEditChannelPurposeModal}
                    channel={channel}
                />
            );
        }

        let pinnedIconClass = 'channel-header__icon';
        if (this.props.rhsState === RHSStates.PIN) {
            pinnedIconClass += ' active';
        }

        return (
            <div
                id='channel-header'
                className='channel-header alt'
            >
                <div className='flex-parent'>
                    <div className='flex-child'>
                        <div
                            id='channelHeaderInfo'
                            className='channel-header__info'
                        >
                            <div
                                id='channelHeaderTitle'
                                className='channel-header__title dropdown'
                            >
                                {toggleFavorite}
                                <h2>
                                    <button
                                        id='channelHeaderDropdownButton'
                                        className='dropdown-toggle theme style--none'
                                        type='button'
                                        data-toggle='dropdown'
                                        aria-expanded='true'
                                    >
                                        <strong
                                            id='channelHeaderTitle'
                                            className='heading'
                                        >
                                            {channelTitle}
                                        </strong>
                                        <span
                                            id='channelHeaderDropdownIcon'
                                            className='fa fa-angle-down header-dropdown__icon'
                                        />
                                    </button>
                                    <ul
                                        id='channelHeaderDropdownMenu'
                                        className='dropdown-menu'
                                        role='menu'
                                        aria-labelledby='channel_header_dropdown'
                                    >
                                        {dropdownContents}
                                    </ul>
                                </h2>
                                {muteTrigger}
                            </div>
                            {headerTextContainer}
                        </div>
                    </div>
                    <div className='flex-child'>
                        {webrtc}
                    </div>
                    <div className='flex-child'>
                        {popoverListMembers}
                    </div>
                    <div className='flex-child'>
                        <Pluggable pluggableName='ChannelHeaderButton'/>
                    </div>
                    <HeaderIconWrapper
                        iconComponent={
                            <PinIcon
                                className='icon icon__pin'
                                aria-hidden='true'
                            />
                        }
                        buttonClass={'style--none ' + pinnedIconClass}
                        buttonId={'channelHeaderPinButton'}
                        onClick={this.getPinnedPosts}
                        tooltipKey={'pinnedPosts'}
                    />
                    {this.state.showSearchBar ? (
                        <div className='flex-child search-bar__container'>
                            <SearchBar
                                showMentionFlagBtns={false}
                                isFocus={Utils.isMobile()}
                            />
                        </div>
                    ) : (
                        <HeaderIconWrapper
                            iconComponent={
                                <SearchIcon
                                    className='icon icon__search icon--stroke'
                                    aria-hidden='true'
                                />
                            }
                            buttonId={'channelHeaderSearchButton'}
                            onClick={this.searchButtonClick}
                            tooltipKey={'search'}
                        />
                    )}
                    <HeaderIconWrapper
                        iconComponent={
                            <MentionsIcon
                                className='icon icon__mentions'
                                aria-hidden='true'
                            />
                        }
                        buttonId={'channelHeaderMentionButton'}
                        onClick={this.searchMentions}
                        tooltipKey={'recentMentions'}
                    />
                    <HeaderIconWrapper
                        iconComponent={
                            <FlagIcon className='icon icon__flag'/>
                        }
                        buttonId={'channelHeaderFlagButton'}
                        onClick={this.getFlagged}
                        tooltipKey={'flaggedPosts'}
                    />
                </div>
                {editHeaderModal}
                {editPurposeModal}
                {channelMembersModal}
                <ChannelNotificationsModal
                    show={this.state.showChannelNotificationsModal}
                    onHide={this.hideChannelNotificationsModal}
                    channel={channel}
                    channelMember={this.props.channelMember}
                    currentUser={this.props.currentUser}
                />
                <RenameChannelModal
                    show={this.state.showRenameChannelModal}
                    onHide={this.hideRenameChannelModal}
                    channel={channel}
                />
            </div>
        );
    }
}
