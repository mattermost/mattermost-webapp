// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import NavbarSearchBox from 'components/search_bar.jsx';
import MessageWrapper from 'components/message_wrapper.jsx';
import PopoverListMembers from 'components/popover_list_members';
import EditChannelHeaderModal from 'components/edit_channel_header_modal.jsx';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal.jsx';
import ChannelInfoModal from 'components/channel_info_modal.jsx';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal.jsx';
import ChannelNotificationsModal from 'components/channel_notifications_modal.jsx';
import DeleteChannelModal from 'components/delete_channel_modal.jsx';
import RenameChannelModal from 'components/rename_channel_modal.jsx';
import ToggleModalButton from 'components/toggle_modal_button.jsx';

import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebrtcActions from 'actions/webrtc_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import * as ChannelUtils from 'utils/channel_utils.jsx';
import {getSiteURL} from 'utils/url.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {getFlaggedPosts, getPinnedPosts} from 'actions/post_actions.jsx';
import SearchStore from 'stores/search_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';

import {Constants, UserStatuses, ActionTypes, RHSStates} from 'utils/constants.jsx';

import 'bootstrap';
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Tooltip, OverlayTrigger, Popover} from 'react-bootstrap';

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
        actions: PropTypes.shape({
            leaveChannel: PropTypes.func.isRequired,
            favoriteChannel: PropTypes.func.isRequired,
            unfavoriteChannel: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            showEditChannelHeaderModal: false,
            showEditChannelPurposeModal: false,
            showMembersModal: false,
            showRenameChannelModal: false,
            rhsState: '',
            isBusy: WebrtcStore.isBusy()
        };
    }

    componentDidMount() {
        WebrtcStore.addChangedListener(this.onWebrtcChange);
        WebrtcStore.addBusyListener(this.onBusy);
        SearchStore.addSearchChangeListener(this.onSearchChange);
        document.addEventListener('keydown', this.handleShortcut);
    }

    componentWillUnmount() {
        WebrtcStore.removeChangedListener(this.onWebrtcChange);
        WebrtcStore.removeBusyListener(this.onBusy);
        SearchStore.removeSearchChangeListener(this.onSearchChange);
        document.removeEventListener('keydown', this.handleShortcut);
    }

    onSearchChange = () => {
        let rhsState = '';
        if (SearchStore.isPinnedPosts) {
            rhsState = RHSStates.PIN;
        } else if (SearchStore.isFlaggedPosts) {
            rhsState = RHSStates.FLAG;
        } else if (SearchStore.isMentionSearch) {
            rhsState = RHSStates.MENTION;
        }
        this.setState({rhsState});
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

    toggleFavorite = (e) => {
        e.preventDefault();

        if (this.props.isFavorite) {
            this.props.actions.unfavoriteChannel(this.props.channel.id);
        } else {
            this.props.actions.favoriteChannel(this.props.channel.id);
        }
    };

    searchMentions = (e) => {
        e.preventDefault();
        if (this.state.rhsState === RHSStates.MENTION) {
            GlobalActions.toggleSideBarAction(false);
        } else {
            GlobalActions.emitSearchMentionsEvent(this.props.currentUser);
        }
    }

    getPinnedPosts = (e) => {
        e.preventDefault();
        if (this.state.rhsState === RHSStates.PIN) {
            GlobalActions.toggleSideBarAction(false);
        } else {
            getPinnedPosts(this.props.channel.id);
        }
    }

    getFlagged = (e) => {
        e.preventDefault();
        if (this.state.rhsState === RHSStates.FLAG) {
            GlobalActions.toggleSideBarAction(false);
        } else {
            getFlaggedPosts();
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

    initWebrtc = (contactId, isOnline) => {
        if (isOnline && !this.state.isBusy) {
            GlobalActions.emitCloseRightHandSide();
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
            channelTitle = Utils.displayUsername(teammateId);

            const webrtcEnabled = global.mm_config.EnableWebrtc === 'true' && userMedia && Utils.isFeatureEnabled(PreReleaseFeatures.WEBRTC_PREVIEW);

            if (webrtcEnabled) {
                const isOffline = dmUserStatus === UserStatuses.OFFLINE;
                const busy = this.props.dmUserIsInCall;
                let circleClass = '';
                let webrtcMessage;

                if (isOffline || busy) {
                    circleClass = 'offline';
                    webrtcMessage = (
                        <FormattedMessage
                            id='channel_header.webrtc.offline'
                            defaultMessage='The user is offline'
                        />
                    );

                    if (busy) {
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
                    <div className='webrtc__header channel-header__icon'>
                        <a
                            href='#'
                            onClick={() => this.initWebrtc(dmUserId, !isOffline)}
                            disabled={isOffline}
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
                                    <span dangerouslySetInnerHTML={{__html: Constants.VIDEO_ICON}}/>
                                </div>
                            </OverlayTrigger>
                        </a>
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
                    <ToggleModalButton
                        id='channelEditHeaderDirect'
                        role='menuitem'
                        dialogType={EditChannelHeaderModal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='channel_header.channelHeader'
                            defaultMessage='Edit Channel Header'
                        />
                    </ToggleModalButton>
                </li>
            );
        } else if (isGroup) {
            dropdownContents.push(
                <li
                    key='edit_header_direct'
                    role='presentation'
                >
                    <ToggleModalButton
                        id='channelEditHeaderGroup'
                        role='menuitem'
                        dialogType={EditChannelHeaderModal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='channel_header.channelHeader'
                            defaultMessage='Edit Channel Header'
                        />
                    </ToggleModalButton>
                </li>
            );

            dropdownContents.push(
                <li
                    key='notification_preferences'
                    role='presentation'
                >
                    <ToggleModalButton
                        id='channelnotificationPreferencesGroup'
                        role='menuitem'
                        dialogType={ChannelNotificationsModal}
                        dialogProps={{
                            channel,
                            channelMember: this.props.channelMember,
                            currentUser: this.props.currentUser
                        }}
                    >
                        <FormattedMessage
                            id='channel_header.notificationPreferences'
                            defaultMessage='Notification Preferences'
                        />
                    </ToggleModalButton>
                </li>
            );

            dropdownContents.push(
                <li
                    key='add_members'
                    role='presentation'
                >
                    <a
                        id='channelAddMembersGroup'
                        role='menuitem'
                        href='#'
                        onClick={this.openDirectMessageModal}
                    >
                        <FormattedMessage
                            id='channel_header.addMembers'
                            defaultMessage='Add Members'
                        />
                    </a>
                </li>
            );
        } else {
            dropdownContents.push(
                <li
                    key='view_info'
                    role='presentation'
                >
                    <ToggleModalButton
                        id='channelViewInfo'
                        role='menuitem'
                        dialogType={ChannelInfoModal}
                        dialogProps={{channel}}
                    >
                        <FormattedMessage
                            id='channel_header.viewInfo'
                            defaultMessage='View Info'
                        />
                    </ToggleModalButton>
                </li>
            );

            if (this.props.isDefault) {
                dropdownContents.push(
                    <li
                        key='manage_members'
                        role='presentation'
                    >
                        <a
                            id='channelManageMembers'
                            role='menuitem'
                            href='#'
                            onClick={() => this.setState({showMembersModal: true})}
                        >
                            <FormattedMessage
                                id='channel_header.viewMembers'
                                defaultMessage='View Members'
                            />
                        </a>
                    </li>
                );
            }

            dropdownContents.push(
                <li
                    key='notification_preferences'
                    role='presentation'
                >
                    <ToggleModalButton
                        id='channelNotificationPreferences'
                        role='menuitem'
                        dialogType={ChannelNotificationsModal}
                        dialogProps={{
                            channel,
                            channelMember: this.props.channelMember,
                            currentUser: this.props.currentUser
                        }}
                    >
                        <FormattedMessage
                            id='channel_header.notificationPreferences'
                            defaultMessage='Notification Preferences'
                        />
                    </ToggleModalButton>
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
                            <ToggleModalButton
                                id='channelAddMembers'
                                ref='channelInviteModalButton'
                                role='menuitem'
                                dialogType={ChannelInviteModal}
                                dialogProps={{channel, currentUser: this.props.currentUser}}
                            >
                                <FormattedMessage
                                    id='channel_header.addMembers'
                                    defaultMessage='Add Members'
                                />
                            </ToggleModalButton>
                        </li>
                    );

                    dropdownContents.push(
                        <li
                            key='manage_members'
                            role='presentation'
                        >
                            <a
                                id='channelManageMembers'
                                role='menuitem'
                                href='#'
                                onClick={() => this.setState({showMembersModal: true})}
                            >
                                <FormattedMessage
                                    id='channel_header.manageMembers'
                                    defaultMessage='Manage Members'
                                />
                            </a>
                        </li>
                    );
                } else {
                    dropdownContents.push(
                        <li
                            key='view_members'
                            role='presentation'
                        >
                            <a
                                id='channelViewMembers'
                                role='menuitem'
                                href='#'
                                onClick={() => this.setState({showMembersModal: true})}
                            >
                                <FormattedMessage
                                    id='channel_header.viewMembers'
                                    defaultMessage='View Members'
                                />
                            </a>
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
                        <ToggleModalButton
                            id='channelEditHeader'
                            role='menuitem'
                            dialogType={EditChannelHeaderModal}
                            dialogProps={{channel}}
                        >
                            <FormattedMessage
                                id='channel_header.setHeader'
                                defaultMessage='Edit Channel Header'
                            />
                        </ToggleModalButton>
                    </li>
                );

                dropdownContents.push(
                    <li
                        key='set_channel_purpose'
                        role='presentation'
                    >
                        <a
                            id='channelEditPurpose'
                            role='menuitem'
                            href='#'
                            onClick={() => this.setState({showEditChannelPurposeModal: true})}
                        >
                            <FormattedMessage
                                id='channel_header.setPurpose'
                                defaultMessage='Edit Channel Purpose'
                            />
                        </a>
                    </li>
                );

                dropdownContents.push(
                    <li
                        key='rename_channel'
                        role='presentation'
                    >
                        <a
                            id='channelRename'
                            role='menuitem'
                            href='#'
                            onClick={this.showRenameChannelModal}
                        >
                            <FormattedMessage
                                id='channel_header.rename'
                                defaultMessage='Rename Channel'
                            />
                        </a>
                    </li>
                );
            }

            if (ChannelUtils.showDeleteOptionForCurrentUser(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin)) {
                dropdownContents.push(
                    <li
                        key='delete_channel'
                        role='presentation'
                    >
                        <ToggleModalButton
                            id='channelDelete'
                            role='menuitem'
                            dialogType={DeleteChannelModal}
                            dialogProps={{channel}}
                        >
                            <FormattedMessage
                                id='channel_header.delete'
                                defaultMessage='Delete Channel'
                            />
                        </ToggleModalButton>
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
                        <a
                            id='channelLeave'
                            role='menuitem'
                            href='#'
                            onClick={this.handleLeave}
                        >
                            <FormattedMessage
                                id='channel_header.leave'
                                defaultMessage='Leave Channel'
                            />
                        </a>
                    </li>
                );
            }
        }

        let headerTextContainer;
        if (channel.header) {
            let headerTextElement;
            if (this.props.enableFormatting) {
                headerTextElement = (
                    <div
                        onClick={Utils.handleFormattedTextClick}
                        className='channel-header__description'
                        dangerouslySetInnerHTML={{__html: TextFormatting.formatText(channel.header, {singleline: true, mentionHighlight: false, siteURL: getSiteURL()})}}
                    />
                );
            } else {
                headerTextElement = (
                    <div
                        onClick={Utils.handleFormattedTextClick}
                        className='channel-header__description'
                    >
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
            headerTextContainer = (
                <a
                    href='#'
                    className='channel-header__description light'
                    onClick={() => this.setState({showEditChannelHeaderModal: true})}
                >
                    <FormattedMessage
                        id='channel_header.addChannelHeader'
                        defaultMessage='Add a channel description'
                    />
                </a>
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
                <a
                    id='toggleFavorite'
                    href='#'
                    onClick={this.toggleFavorite}
                    className={'channel-header__favorites ' + (this.props.isFavorite ? 'active' : 'inactive')}
                >
                    <i className={'icon fa ' + (this.props.isFavorite ? 'fa-star' : 'fa-star-o')}/>
                </a>
            </OverlayTrigger>
        );

        let channelMembersModal;
        if (this.state.showMembersModal) {
            channelMembersModal = (
                <ChannelMembersModal
                    onModalDismissed={() => this.setState({showMembersModal: false})}
                    showInviteModal={() => this.refs.channelInviteModalButton.show()}
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
        if (this.state.rhsState === RHSStates.PIN) {
            pinnedIconClass += ' active';
        }

        return (
            <div
                id='channel-header'
                className='channel-header alt'
            >
                <div className='flex-parent'>
                    <div className='flex-child'>
                        <div className='channel-header__info'>
                            {toggleFavorite}
                            <div className='channel-header__title dropdown'>
                                <a
                                    id='channelHeaderDropdown'
                                    href='#'
                                    className='dropdown-toggle theme'
                                    type='button'
                                    data-toggle='dropdown'
                                    aria-expanded='true'
                                >
                                    <strong className='heading'>{channelTitle} </strong>
                                    <span className='fa fa-angle-down header-dropdown__icon'/>
                                </a>
                                <ul
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
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='bottom'
                            overlay={pinnedPostTooltip}
                        >
                            <div
                                className={pinnedIconClass}
                                onClick={this.getPinnedPosts}
                            >
                                <span
                                    className='icon icon__pin'
                                    dangerouslySetInnerHTML={{__html: pinIcon}}
                                    aria-hidden='true'
                                />
                            </div>
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
                            <div
                                className='channel-header__icon icon--hidden'
                                onClick={this.searchMentions}
                            >
                                <span
                                    className='icon icon__mentions'
                                    dangerouslySetInnerHTML={{__html: mentionsIcon}}
                                    aria-hidden='true'
                                />
                            </div>
                        </OverlayTrigger>
                    </div>
                    <div className='flex-child'>
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='bottom'
                            overlay={flaggedTooltip}
                        >
                            <div
                                className='channel-header__icon icon--hidden'
                                onClick={this.getFlagged}

                            >
                                <span
                                    className='icon icon__flag'
                                    dangerouslySetInnerHTML={{__html: flagIcon}}
                                />
                            </div>
                        </OverlayTrigger>
                    </div>
                </div>
                {editHeaderModal}
                {editPurposeModal}
                {channelMembersModal}
                <RenameChannelModal
                    show={this.state.showRenameChannelModal}
                    onHide={this.hideRenameChannelModal}
                    channel={channel}
                />
            </div>
        );
    }
}
