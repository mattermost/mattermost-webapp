// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import 'bootstrap';

import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebrtcActions from 'actions/webrtc_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';

import * as ChannelUtils from 'utils/channel_utils.jsx';
import {ActionTypes, Constants, RHSStates, UserStatuses, ModalIdentifiers} from 'utils/constants.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import {getSiteURL} from 'utils/url.jsx';
import * as Utils from 'utils/utils.jsx';

import ChannelInfoModal from 'components/channel_info_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal.jsx';
import ChannelNotificationsModal from 'components/channel_notifications_modal.jsx';
import DeleteChannelModal from 'components/delete_channel_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import MessageWrapper from 'components/message_wrapper.jsx';
import PopoverListMembers from 'components/popover_list_members';
import RenameChannelModal from 'components/rename_channel_modal';
import NavbarSearchBox from 'components/search_bar';
import StatusIcon from 'components/status_icon.jsx';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

import Pluggable from 'plugins/pluggable';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

export default class ChannelHeader extends React.Component {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        channelMember: PropTypes.object.isRequired,
        teamMember: PropTypes.object.isRequired,
        isFavorite: PropTypes.bool,
        isDefault: PropTypes.bool,
        currentUser: PropTypes.object.isRequired,
        dmUser: PropTypes.object,
        dmUserStatus: PropTypes.object,
        dmUserIsInCall: PropTypes.bool,
        enableFormatting: PropTypes.bool.isRequired,
        rhsState: PropTypes.oneOf(
            Object.values(RHSStates)
        ),
        actions: PropTypes.shape({
            leaveChannel: PropTypes.func.isRequired,
            favoriteChannel: PropTypes.func.isRequired,
            unfavoriteChannel: PropTypes.func.isRequired,
            showFlaggedPosts: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
            showMentions: PropTypes.func.isRequired,
            closeRightHandSide: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired
        }).isRequired
    }

    static defaultProps = {
        dmUser: {},
        dmUserStatus: {status: UserStatuses.OFFLINE}
    }

    constructor(props) {
        super(props);

        this.state = {
            showEditChannelHeaderModal: false,
            showEditChannelPurposeModal: false,
            showMembersModal: false,
            showRenameChannelModal: false,
            showChannelNotificationsModal: false,
            isBusy: WebrtcStore.isBusy()
        };
    }

    componentDidMount() {
        WebrtcStore.addChangedListener(this.onWebrtcChange);
        WebrtcStore.addBusyListener(this.onBusy);
        document.addEventListener('keydown', this.handleShortcut);
    }

    componentWillUnmount() {
        WebrtcStore.removeChangedListener(this.onWebrtcChange);
        WebrtcStore.removeBusyListener(this.onBusy);
        document.removeEventListener('keydown', this.handleShortcut);
    }

    onWebrtcChange = () => {
        this.setState({isBusy: WebrtcStore.isBusy()});
    }

    onBusy = (isBusy) => {
        this.setState({isBusy});
    }

    handleLeave = () => {
        if (this.props.channel.type === Constants.PRIVATE_CHANNEL) {
            GlobalActions.showLeavePrivateChannelModal(this.props.channel);
        } else {
            this.props.actions.leaveChannel(this.props.channel.id);
        }
    }

    toggleFavorite = () => {
        if (this.props.isFavorite) {
            this.props.actions.unfavoriteChannel(this.props.channel.id);
        } else {
            this.props.actions.favoriteChannel(this.props.channel.id);
        }
    };

    searchMentions = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.MENTION) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showMentions();
        }
    }

    getPinnedPosts = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.PIN) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showPinnedPosts();
        }
    }

    getFlagged = (e) => {
        e.preventDefault();
        if (this.props.rhsState === RHSStates.FLAG) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.showFlaggedPosts();
        }
    }

    handleShortcut = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (e.keyCode === Constants.KeyCodes.M) {
                e.preventDefault();
                this.searchMentions(e);
            }
        }
    }

    showRenameChannelModal = (e) => {
        e.preventDefault();

        this.setState({
            showRenameChannelModal: true
        });
    }

    hideRenameChannelModal = () => {
        this.setState({
            showRenameChannelModal: false
        });
    }

    showChannelNotificationsModal = (e) => {
        e.preventDefault();

        this.setState({
            showChannelNotificationsModal: true
        });
    }

    hideChannelNotificationsModal = () => {
        this.setState({
            showChannelNotificationsModal: false
        });
    }

    initWebrtc = (contactId, isOnline) => {
        if (isOnline && !this.state.isBusy) {
            this.props.actions.closeRightHandSide();
            WebrtcActions.initWebrtc(contactId, true);
        }
    }

    openDirectMessageModal = () => {
        AppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_DM_MODAL,
            value: true,
            channelId: this.props.channel.id
        });
    }

    render() {
        if (Utils.isEmptyObject(this.props.channel) ||
                Utils.isEmptyObject(this.props.channelMember) ||
                Utils.isEmptyObject(this.props.currentUser)) {
            // Use an empty div to make sure the header's height stays constant
            return (
                <div className='channel-header'/>
            );
        }

        const flagIcon = Constants.FLAG_ICON_SVG;
        const pinIcon = Constants.PIN_ICON_SVG;
        const mentionsIcon = Constants.MENTIONS_ICON_SVG;

        const channel = this.props.channel;

        const recentMentionsTooltip = (
            <Tooltip id='recentMentionsTooltip'>
                <FormattedMessage
                    id='channel_header.recentMentions'
                    defaultMessage='Recent Mentions'
                />
            </Tooltip>
        );

        const pinnedPostTooltip = (
            <Tooltip id='pinnedPostTooltip'>
                <FormattedMessage
                    id='channel_header.pinnedPosts'
                    defaultMessage='Pinned Posts'
                />
            </Tooltip>
        );

        const flaggedTooltip = (
            <Tooltip
                id='flaggedTooltip'
                className='text-nowrap'
            >
                <FormattedMessage
                    id='channel_header.flagged'
                    defaultMessage='Flagged Posts'
                />
            </Tooltip>
        );

        const popoverContent = (
            <Popover
                id='header-popover'
                bStyle='info'
                bSize='large'
                placement='bottom'
                className='description'
                onMouseOver={() => this.refs.headerOverlay.show()}
                onMouseOut={() => this.refs.headerOverlay.hide()}
            >
                <MessageWrapper
                    message={channel.header}
                />
            </Popover>
        );

        let channelTitle = channel.display_name;
        const isChannelAdmin = Utils.isChannelAdmin(this.props.channelMember.roles);
        const isTeamAdmin = !Utils.isEmptyObject(this.props.teamMember) && Utils.isAdmin(this.props.teamMember.roles);
        const isSystemAdmin = Utils.isSystemAdmin(this.props.currentUser.roles);
        const isDirect = (this.props.channel.type === Constants.DM_CHANNEL);
        const isGroup = (this.props.channel.type === Constants.GM_CHANNEL);
        let webrtc;

        if (isDirect) {
            const userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            const dmUserId = this.props.dmUser.id;
            const dmUserStatus = this.props.dmUserStatus.status;

            const teammateId = Utils.getUserIdFromChannelName(channel);
            if (this.props.currentUser.id === teammateId) {
                channelTitle = (
                    <FormattedMessage
                        id='channel_header.directchannel.you'
                        defaultMessage='{displayname} (you) '
                        values={{
                            displayname: Utils.displayUsername(teammateId)
                        }}
                    />
                );
            } else {
                channelTitle = Utils.displayUsername(teammateId) + ' ';
            }

            const webrtcEnabled = global.mm_config.EnableWebrtc === 'true' && userMedia && Utils.isFeatureEnabled(PreReleaseFeatures.WEBRTC_PREVIEW);

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
                            onClick={() => this.initWebrtc(dmUserId, !isOffline || !isDoNotDisturb)}
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
                    <button
                        className='style--none'
                        id='channelAddMembersGroup'
                        role='menuitem'
                        onClick={this.openDirectMessageModal}
                    >
                        <FormattedMessage
                            id='channel_header.addMembers'
                            defaultMessage='Add Members'
                        />
                    </button>
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
                            onClick={() => this.setState({showMembersModal: true})}
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

                if (ChannelUtils.canManageMembers(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin)) {
                    dropdownContents.push(
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
                    );

                    dropdownContents.push(
                        <li
                            key='manage_members'
                            role='presentation'
                        >
                            <button
                                className='style--none'
                                id='channelManageMembers'
                                role='menuitem'
                                onClick={() => this.setState({showMembersModal: true})}
                            >
                                <FormattedMessage
                                    id='channel_header.manageMembers'
                                    defaultMessage='Manage Members'
                                />
                            </button>
                        </li>
                    );
                } else {
                    dropdownContents.push(
                        <li
                            key='view_members'
                            role='presentation'
                        >
                            <button
                                className='style--none'
                                id='channelViewMembers'
                                role='menuitem'
                                onClick={() => this.setState({showMembersModal: true})}
                            >
                                <FormattedMessage
                                    id='channel_header.viewMembers'
                                    defaultMessage='View Members'
                                />
                            </button>
                        </li>
                    );
                }
            }

            if (ChannelUtils.showManagementOptions(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin)) {
                dropdownContents.push(
                    <li
                        key='divider-2'
                        className='divider'
                    />
                );

                dropdownContents.push(
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
                );

                dropdownContents.push(
                    <li
                        key='set_channel_purpose'
                        role='presentation'
                    >
                        <button
                            className='style--none'
                            id='channelEditPurpose'
                            role='menuitem'
                            onClick={() => this.setState({showEditChannelPurposeModal: true})}
                        >
                            <FormattedMessage
                                id='channel_header.setPurpose'
                                defaultMessage='Edit Channel Purpose'
                            />
                        </button>
                    </li>
                );

                dropdownContents.push(
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
                );
            }

            if (ChannelUtils.showDeleteOptionForCurrentUser(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin)) {
                dropdownContents.push(
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
                );
            }

            if (!this.props.isDefault) {
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
            if (this.props.enableFormatting) {
                headerTextElement = (
                    <div
                        id='channelHeaderDescription'
                        className='channel-header__description'
                    >
                        {dmHeaderIconStatus}
                        {dmHeaderTextStatus}
                        <span
                            onClick={Utils.handleFormattedTextClick}
                            dangerouslySetInnerHTML={{__html: TextFormatting.formatText(channel.header, {singleline: true, mentionHighlight: false, siteURL: getSiteURL()})}}
                        />
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
            if (ChannelUtils.showManagementOptions(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin)) {
                editMessage = (
                    <button
                        className='style--none'
                        onClick={() => this.setState({showEditChannelHeaderModal: true})}
                    >
                        <FormattedMessage
                            id='channel_header.addChannelHeader'
                            defaultMessage='Add a channel description'
                        />
                    </button>
                );
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
                    onHide={() => this.setState({showEditChannelHeaderModal: false})}
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

        let channelMembersModal;
        if (this.state.showMembersModal) {
            const inviteModalData = {
                modalId: ModalIdentifiers.CHANNEL_INVITE,
                dialogType: ChannelInviteModal,
                dialogProps: {channel, currentUser: this.props.currentUser}
            };

            const {openModal} = this.props.actions;

            channelMembersModal = (
                <ChannelMembersModal
                    onModalDismissed={() => this.setState({showMembersModal: false})}
                    showInviteModal={() => openModal(inviteModalData)}
                    channel={channel}
                />
            );
        }

        let editPurposeModal;
        if (this.state.showEditChannelPurposeModal) {
            editPurposeModal = (
                <EditChannelPurposeModal
                    onModalDismissed={() => this.setState({showEditChannelPurposeModal: false})}
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
                            {toggleFavorite}
                            <div
                                id='channelHeaderTitle'
                                className='channel-header__title dropdown'
                            >
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
                    <div className='flex-child'>
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='bottom'
                            overlay={pinnedPostTooltip}
                        >
                            <button
                                id='channelHeaderPinButton'
                                className={'style--none ' + pinnedIconClass}
                                onClick={this.getPinnedPosts}
                            >
                                <span
                                    className='icon icon__pin'
                                    dangerouslySetInnerHTML={{__html: pinIcon}}
                                    aria-hidden='true'
                                />
                            </button>
                        </OverlayTrigger>
                    </div>
                    <div className='flex-child search-bar__container'>
                        <NavbarSearchBox
                            showMentionFlagBtns={false}
                            isFocus={Utils.isMobile()}
                        />
                    </div>
                    <div className='flex-child'>
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='bottom'
                            overlay={recentMentionsTooltip}
                        >
                            <button
                                id='channelHeaderMentionButton'
                                className='channel-header__icon icon--hidden style--none'
                                onClick={this.searchMentions}
                            >
                                <span
                                    className='icon icon__mentions'
                                    dangerouslySetInnerHTML={{__html: mentionsIcon}}
                                    aria-hidden='true'
                                />
                            </button>
                        </OverlayTrigger>
                    </div>
                    <div className='flex-child'>
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='bottom'
                            overlay={flaggedTooltip}
                        >
                            <button
                                id='channelHeaderFlagButton'
                                className='channel-header__icon icon--hidden style--none'
                                onClick={this.getFlagged}

                            >
                                <span
                                    className='icon icon__flag'
                                    dangerouslySetInnerHTML={{__html: flagIcon}}
                                />
                            </button>
                        </OverlayTrigger>
                    </div>
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
