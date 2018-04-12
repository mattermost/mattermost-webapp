// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {Permissions} from 'mattermost-redux/constants';

import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import * as ChannelActions from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebrtcActions from 'actions/webrtc_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import ModalStore from 'stores/modal_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import * as ChannelUtils from 'utils/channel_utils.jsx';
import {ActionTypes, Constants, ModalIdentifiers, RHSStates, UserStatuses} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import ChannelInfoModal from 'components/channel_info_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal';
import ChannelNotificationsModal from 'components/channel_notifications_modal';
import DeleteChannelModal from 'components/delete_channel_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import NotifyCounts from 'components/notify_counts.jsx';
import QuickSwitchModal from 'components/quick_switch_modal';
import RenameChannelModal from 'components/rename_channel_modal';
import StatusIcon from 'components/status_icon.jsx';
import MenuIcon from 'components/svg/menu_icon';
import SearchIcon from 'components/svg/search_icon';
import ToggleModalButton from 'components/toggle_modal_button.jsx';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

import Pluggable from 'plugins/pluggable';

import NavbarInfoButton from './navbar_info_button.jsx';

export default class Navbar extends React.Component {
    static propTypes = {
        teamDisplayName: PropTypes.string,
        isPinnedPosts: PropTypes.bool,
        enableWebrtc: PropTypes.bool.isRequired,
        isReadOnly: PropTypes.bool,
        actions: PropTypes.shape({
            updateRhsState: PropTypes.func,
            showPinnedPosts: PropTypes.func,
            toggleLhs: PropTypes.func.isRequired,
            closeLhs: PropTypes.func.isRequired,
            closeRhs: PropTypes.func.isRequired,
            toggleRhsMenu: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
        }),
    };

    static defaultProps = {
        teamDisplayName: '',
    };

    constructor(props) {
        super(props);

        this.state = {
            ...this.getStateFromStores(),
            showEditChannelPurposeModal: false,
            showEditChannelHeaderModal: false,
            showMembersModal: false,
            showRenameChannelModal: false,
            showQuickSwitchModal: false,
            showChannelNotificationsModal: false,
            quickSwitchMode: 'channel',
        };
    }

    componentDidMount() {
        ChannelStore.addChangeListener(this.onChange);
        ChannelStore.addStatsChangeListener(this.onChange);
        UserStore.addStatusesChangeListener(this.onChange);
        UserStore.addChangeListener(this.onChange);
        PreferenceStore.addChangeListener(this.onChange);
        ModalStore.addModalListener(ActionTypes.TOGGLE_QUICK_SWITCH_MODAL, this.toggleQuickSwitchModal);
        ModalStore.addModalListener(ActionTypes.TOGGLE_CHANNEL_HEADER_UPDATE_MODAL, this.showEditChannelHeaderModal);
        ModalStore.addModalListener(ActionTypes.TOGGLE_CHANNEL_PURPOSE_UPDATE_MODAL, this.showChannelPurposeModal);
        ModalStore.addModalListener(ActionTypes.TOGGLE_CHANNEL_NAME_UPDATE_MODAL, this.showRenameChannelModal);
        WebrtcStore.addChangedListener(this.onChange);
        WebrtcStore.addBusyListener(this.onBusy);
        document.addEventListener('keydown', this.handleQuickSwitchKeyPress);
        $('.inner-wrap').on('click', this.hideSidebars);
    }

    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.onChange);
        ChannelStore.removeStatsChangeListener(this.onChange);
        UserStore.removeStatusesChangeListener(this.onChange);
        UserStore.removeChangeListener(this.onChange);
        PreferenceStore.removeChangeListener(this.onChange);
        ModalStore.removeModalListener(ActionTypes.TOGGLE_QUICK_SWITCH_MODAL, this.toggleQuickSwitchModal);
        ModalStore.removeModalListener(ActionTypes.TOGGLE_CHANNEL_HEADER_UPDATE_MODAL, this.showEditChannelHeaderModal);
        ModalStore.removeModalListener(ActionTypes.TOGGLE_CHANNEL_PURPOSE_UPDATE_MODAL, this.showChannelPurposeModal);
        ModalStore.removeModalListener(ActionTypes.TOGGLE_CHANNEL_NAME_UPDATE_MODAL, this.showRenameChannelModal);
        WebrtcStore.removeChangedListener(this.onChange);
        WebrtcStore.removeBusyListener(this.onBusy);
        document.removeEventListener('keydown', this.handleQuickSwitchKeyPress);
        $('.inner-wrap').off('click', this.hideSidebars);
    }

    getStateFromStores = () => {
        const channel = ChannelStore.getCurrent();

        let contactId = null;
        if (channel && channel.type === 'D') {
            contactId = Utils.getUserIdFromChannelName(channel);
        }

        return {
            channel,
            member: ChannelStore.getCurrentMember(),
            users: [],
            userCount: ChannelStore.getCurrentStats().member_count,
            currentUser: UserStore.getCurrentUser(),
            isFavorite: channel && ChannelUtils.isFavoriteChannel(channel),
            contactId,
            isBusy: WebrtcStore.isBusy(),
        };
    }

    isStateValid = () => {
        return this.state.channel && this.state.member && this.state.users && this.state.currentUser;
    }

    handleLeave = () => {
        if (this.state.channel.type === Constants.PRIVATE_CHANNEL) {
            GlobalActions.showLeavePrivateChannelModal(this.state.channel);
        } else {
            ChannelActions.leaveChannel(this.state.channel.id);
        }
    }

    hideSidebars = (e) => {
        var windowWidth = $(window).outerWidth();
        if (windowWidth <= 768) {
            this.props.actions.closeRhs();

            if (e.target.className !== 'navbar-toggle' && e.target.className !== 'icon-bar') {
                this.props.actions.closeLhs();
                this.props.actions.closeRhs();
                this.props.actions.closeRhsMenu();
            }
        }
    }

    toggleLeftSidebar = () => {
        this.props.actions.toggleLhs();
    }

    toggleRightSidebar = () => {
        this.props.actions.toggleRhsMenu();
    }

    showSearch = () => {
        this.props.actions.updateRhsState(RHSStates.SEARCH);
    }

    onChange = () => {
        this.setState(this.getStateFromStores());
    }

    showEditChannelHeaderModal = () => {
        this.setState({
            showEditChannelHeaderModal: true,
        });
    }

    hideEditChannelHeaderModal = () => {
        this.setState({
            showEditChannelHeaderModal: false,
        });
    }

    showChannelNotificationsModal = (e) => {
        e.preventDefault();

        this.setState({
            showChannelNotificationsModal: true,
        });
    }

    hideChannelNotificationsModal = () => {
        this.setState({
            showChannelNotificationsModal: false,
        });
    }

    showChannelPurposeModal = () => {
        this.setState({
            showEditChannelPurposeModal: true,
        });
    }

    hideChannelPurposeModal = () => {
        this.setState({
            showEditChannelPurposeModal: false,
        });
    }

    showRenameChannelModal = () => {
        this.setState({
            showRenameChannelModal: true,
        });
    }

    hideRenameChannelModal = () => {
        this.setState({
            showRenameChannelModal: false,
        });
    }

    showMembersModal = (e) => {
        e.preventDefault();

        this.setState({showMembersModal: true});
    }

    hideMembersModal = () => {
        this.setState({showMembersModal: false});
    }

    handleQuickSwitchKeyPress = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            if (!e.altKey) {
                e.preventDefault();
                this.toggleQuickSwitchModal('channel');
            }
        }
    }

    toggleQuickSwitchModal = (mode = 'channel') => {
        if (this.state.showQuickSwitchModal) {
            this.setState({showQuickSwitchModal: false, quickSwitchMode: 'channel'});
        } else {
            this.setState({showQuickSwitchModal: true, quickSwitchMode: mode});
        }
    }

    hideQuickSwitchModal = () => {
        this.setState({
            showQuickSwitchModal: false,
            quickSwitchMode: 'channel',
        });
    }

    getPinnedPosts = (e) => {
        e.preventDefault();
        if (this.props.isPinnedPosts) {
            GlobalActions.emitCloseRightHandSide();
        } else {
            this.props.actions.showPinnedPosts(this.state.channel.id);
        }
    }

    toggleFavorite = (e) => {
        e.preventDefault();

        if (this.state.isFavorite) {
            ChannelActions.unmarkFavorite(this.state.channel.id);
        } else {
            ChannelActions.markFavorite(this.state.channel.id);
        }
    };

    onBusy = (isBusy) => {
        this.setState({isBusy});
    }

    isContactNotAvailable() {
        const contactStatus = UserStore.getStatus(this.state.contactId);

        return contactStatus === UserStatuses.OFFLINE || contactStatus === UserStatuses.DND || this.state.isBusy;
    }

    isWebrtcEnabled() {
        const userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;
        return this.props.enableWebrtc && userMedia && Utils.isFeatureEnabled(PreReleaseFeatures.WEBRTC_PREVIEW);
    }

    initWebrtc = () => {
        if (!this.isContactNotAvailable()) {
            GlobalActions.emitCloseRightHandSide();
            WebrtcActions.initWebrtc(this.state.contactId, true);
        }
    }

    generateWebrtcDropdown() {
        if (!this.isWebrtcEnabled()) {
            return null;
        }

        let linkClass = '';
        if (this.isContactNotAvailable()) {
            linkClass = 'disable-links';
        }

        return (
            <li
                role='presentation'
                className='webrtc__option'
            >
                <a
                    role='menuitem'
                    href='#'
                    onClick={this.initWebrtc}
                    className={linkClass}
                >
                    <FormattedMessage
                        id='navbar_dropdown.webrtc.call'
                        defaultMessage='Start Video Call'
                    />
                </a>
            </li>
        );
    }

    generateWebrtcIcon() {
        const channel = this.state.channel || {};
        if (!this.isWebrtcEnabled() || channel.type !== Constants.DM_CHANNEL) {
            return null;
        }

        let circleClass = '';
        if (this.isContactNotAvailable()) {
            circleClass = 'offline';
        }

        return (
            <div className={'pull-right description navbar-right__icon webrtc__button ' + circleClass}>
                <a onClick={this.initWebrtc}>
                    {'WebRTC'}
                </a>
            </div>
        );
    }

    hideHeaderOverlay = () => {
        if (this.refs.headerOverlay) {
            this.refs.headerOverlay.hide();
        }
    }

    createDropdown = (teamId, channel, channelTitle, isDirect, isGroup) => {
        if (channel) {
            let viewInfoOption;
            let webrtcOption;
            let viewPinnedPostsOption;
            let addMembersOption;
            let manageMembersOption;
            let setChannelHeaderOption;
            let setChannelPurposeOption;
            let notificationPreferenceOption;
            let renameChannelOption;
            let deleteChannelOption;
            let leaveChannelOption;

            if (isDirect) {
                setChannelHeaderOption = (
                    <li role='presentation'>
                        <a
                            role='menuitem'
                            href='#'
                            onClick={this.showEditChannelHeaderModal}
                        >
                            <FormattedMessage
                                id='channel_header.channelHeader'
                                defaultMessage='Edit Channel Header'
                            />
                        </a>
                    </li>
                );

                webrtcOption = this.generateWebrtcDropdown();
            } else if (isGroup) {
                setChannelHeaderOption = (
                    <li role='presentation'>
                        <a
                            role='menuitem'
                            href='#'
                            onClick={this.showEditChannelHeaderModal}
                        >
                            <FormattedMessage
                                id='channel_header.channelHeader'
                                defaultMessage='Edit Channel Header'
                            />
                        </a>
                    </li>
                );

                notificationPreferenceOption = (
                    <li role='presentation'>
                        <a
                            role='menuitem'
                            href='#'
                            onClick={this.showChannelNotificationsModal}
                        >
                            <FormattedMessage
                                id='navbar.preferences'
                                defaultMessage='Notification Preferences'
                            />
                        </a>
                    </li>
                );

                addMembersOption = (
                    <li role='presentation'>
                        <ToggleModalButtonRedux
                            id='channelAddMembersGroup'
                            role='menuitem'
                            modalId={ModalIdentifiers.CREATE_DM_CHANNEL}
                            dialogType={MoreDirectChannels}
                            dialogProps={{isExistingChannel: true}}
                        >
                            <FormattedMessage
                                id='navbar.addMembers'
                                defaultMessage='Add Members'
                            />
                        </ToggleModalButtonRedux>
                    </li>
                );
            } else {
                const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
                viewInfoOption = (
                    <li role='presentation'>
                        <ToggleModalButtonRedux
                            role='menuitem'
                            modalId={ModalIdentifiers.CHANNEL_INFO}
                            dialogType={ChannelInfoModal}
                            dialogProps={{channel}}
                        >
                            <FormattedMessage
                                id='navbar.viewInfo'
                                defaultMessage='View Info'
                            />
                        </ToggleModalButtonRedux>
                    </li>
                );

                viewPinnedPostsOption = (
                    <li role='presentation'>
                        <a
                            role='menuitem'
                            href='#'
                            onClick={this.getPinnedPosts}
                        >
                            <FormattedMessage
                                id='navbar.viewPinnedPosts'
                                defaultMessage='View Pinned Posts'
                            />
                        </a>
                    </li>
                );

                if (ChannelStore.isDefault(channel)) {
                    manageMembersOption = (
                        <li
                            key='view_members'
                            role='presentation'
                        >
                            <a
                                role='menuitem'
                                href='#'
                                onClick={this.showMembersModal}
                            >
                                <FormattedMessage
                                    id='channel_header.viewMembers'
                                    defaultMessage='View Members'
                                />
                            </a>
                        </li>
                    );
                } else {
                    addMembersOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                            key='add_members_permission'
                        >
                            <li role='presentation'>
                                <ToggleModalButton
                                    ref='channelInviteModalButton'
                                    role='menuitem'
                                    dialogType={ChannelInviteModal}
                                    dialogProps={{channel, currentUser: this.state.currentUser}}
                                >
                                    <FormattedMessage
                                        id='navbar.addMembers'
                                        defaultMessage='Add Members'
                                    />
                                </ToggleModalButton>
                            </li>
                        </ChannelPermissionGate>
                    );

                    manageMembersOption = (
                        <li
                            key='manage_members'
                            role='presentation'
                        >
                            <a
                                role='menuitem'
                                href='#'
                                onClick={this.showMembersModal}
                            >
                                <ChannelPermissionGate
                                    channelId={channel.id}
                                    teamId={teamId}
                                    permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                                >
                                    <FormattedMessage
                                        id='channel_header.manageMembers'
                                        defaultMessage='Manage Members'
                                    />
                                </ChannelPermissionGate>
                                <ChannelPermissionGate
                                    channelId={channel.id}
                                    teamId={teamId}
                                    invert={true}
                                    permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                                >
                                    <FormattedMessage
                                        id='channel_header.viewMembers'
                                        defaultMessage='View Members'
                                    />
                                </ChannelPermissionGate>
                            </a>
                        </li>
                    );
                }

                notificationPreferenceOption = (
                    <li role='presentation'>
                        <a
                            role='menuitem'
                            href='#'
                            onClick={this.showChannelNotificationsModal}
                        >
                            <FormattedMessage
                                id='navbar.preferences'
                                defaultMessage='Notification Preferences'
                            />
                        </a>
                    </li>
                );

                if (!this.props.isReadOnly) {
                    setChannelHeaderOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <li role='presentation'>
                                <a
                                    role='menuitem'
                                    href='#'
                                    onClick={this.showEditChannelHeaderModal}
                                >
                                    <FormattedMessage
                                        id='channel_header.setHeader'
                                        defaultMessage='Edit Channel Header'
                                    />
                                </a>
                            </li>
                        </ChannelPermissionGate>
                    );

                    setChannelPurposeOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <li role='presentation'>
                                <a
                                    role='menuitem'
                                    href='#'
                                    onClick={this.showChannelPurposeModal}
                                >
                                    <FormattedMessage
                                        id='channel_header.setPurpose'
                                        defaultMessage='Edit Channel Purpose'
                                    />
                                </a>
                            </li>
                        </ChannelPermissionGate>
                    );

                    renameChannelOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <li role='presentation'>
                                <a
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
                        </ChannelPermissionGate>
                    );

                    deleteChannelOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.DELETE_PRIVATE_CHANNEL : Permissions.DELETE_PUBLIC_CHANNEL]}
                        >
                            <li role='presentation'>
                                <ToggleModalButton
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
                        </ChannelPermissionGate>
                    );
                }

                if (!ChannelStore.isDefault(channel)) {
                    leaveChannelOption = (
                        <li role='presentation'>
                            <a
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

            const toggleFavoriteOption = (
                <li
                    key='toggle_favorite'
                    role='presentation'
                >
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.toggleFavorite}
                    >
                        {this.state.isFavorite ?
                            <FormattedMessage
                                id='channelHeader.removeFromFavorites'
                                defaultMessage='Remove from Favorites'
                            /> :
                            <FormattedMessage
                                id='channelHeader.addToFavorites'
                                defaultMessage='Add to Favorites'
                            />}
                    </a>
                </li>
            );

            return (
                <div className='navbar-brand'>
                    <div className='dropdown'>
                        {this.generateWebrtcIcon()}
                        <a
                            href='#'
                            className='dropdown-toggle theme'
                            type='button'
                            data-toggle='dropdown'
                            aria-expanded='true'
                        >
                            <span className='heading'><StatusIcon status={this.getTeammateStatus()}/>{channelTitle} </span>
                            <span className='fa fa-angle-down header-dropdown__icon'/>
                        </a>
                        <ul
                            className='dropdown-menu'
                            role='menu'
                        >
                            {viewInfoOption}
                            {webrtcOption}
                            {viewPinnedPostsOption}
                            {notificationPreferenceOption}
                            {addMembersOption}
                            {manageMembersOption}
                            {setChannelHeaderOption}
                            {setChannelPurposeOption}
                            {renameChannelOption}
                            {deleteChannelOption}
                            {leaveChannelOption}
                            {toggleFavoriteOption}
                            <div
                                className='close visible-xs-block'
                                onClick={this.hideHeaderOverlay}
                            >
                                {'×'}
                            </div>
                        </ul>
                    </div>
                </div>
            );
        }

        return (
            <div className='navbar-brand'>
                <Link
                    to={TeamStore.getCurrentTeamUrl() + `/channels/${Constants.DEFAULT_CHANNEL}`}
                    className='heading'
                >
                    {channelTitle}
                </Link>
            </div>
        );
    }

    createCollapseButtons = (currentId) => {
        var buttons = [];

        if (currentId == null) {
            buttons.push(
                <button
                    key='navbar-toggle-collapse'
                    type='button'
                    className='navbar-toggle'
                    data-toggle='collapse'
                    data-target='#navbar-collapse-1'
                >
                    <span className='sr-only'>
                        <FormattedMessage
                            id='navbar.toggle1'
                            defaultMessage='Toggle sidebar'
                        />
                    </span>
                    <span className='icon-bar'/>
                    <span className='icon-bar'/>
                    <span className='icon-bar'/>
                </button>
            );
        } else {
            buttons.push(
                <button
                    key='navbar-toggle-sidebar'
                    type='button'
                    className='navbar-toggle'
                    data-toggle='collapse'
                    data-target='#sidebar-nav'
                    onClick={this.toggleLeftSidebar}
                >
                    <span className='sr-only'>
                        <FormattedMessage
                            id='navbar.toggle2'
                            defaultMessage='Toggle sidebar'
                        />
                    </span>
                    <MenuIcon className='icon icon__menu icon--sidebarHeaderTextColor'/>
                    <NotifyCounts/>
                </button>
            );

            buttons.push(
                <button
                    key='navbar-toggle-menu'
                    type='button'
                    className='navbar-toggle navbar-right__icon menu-toggle pull-right'
                    data-toggle='collapse'
                    data-target='#sidebar-nav'
                    onClick={this.toggleRightSidebar}
                >
                    <MenuIcon/>
                </button>
            );
        }

        return buttons;
    }

    getTeammateStatus = () => {
        const channel = this.state.channel;

        // get status for direct message channels
        if (channel.type === 'D') {
            const currentUserId = this.state.currentUser.id;
            const teammate = this.state.users.find((user) => user.id !== currentUserId);
            if (teammate) {
                return UserStore.getStatus(teammate.id);
            }
        }
        return null;
    }

    showChannelInviteModalButton = () => {
        if (this.refs.channelInviteModalButton) {
            this.refs.channelInviteModalButton.show();
        }
    }

    render() {
        if (!this.isStateValid()) {
            return null;
        }

        var currentId = this.state.currentUser.id;
        var channel = this.state.channel;
        var channelTitle = this.props.teamDisplayName;
        var isDirect = false;
        let isGroup = false;
        const teamId = channel && channel.team_id;

        var editChannelHeaderModal = null;
        var editChannelPurposeModal = null;
        let renameChannelModal = null;
        let channelMembersModal = null;
        let channelNotificationsModal = null;
        let quickSwitchModal = null;

        if (channel) {
            channelTitle = channel.display_name;

            if (channel.type === Constants.DM_CHANNEL) {
                isDirect = true;
                const teammateId = Utils.getUserIdFromChannelName(channel);
                if (currentId === teammateId) {
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
                    channelTitle = Utils.getDisplayNameByUserId(teammateId);
                }
            } else if (channel.type === Constants.GM_CHANNEL) {
                isGroup = true;
            }

            if (this.state.showEditChannelHeaderModal) {
                editChannelHeaderModal = (
                    <EditChannelHeaderModal
                        onHide={this.hideEditChannelHeaderModal}
                        channel={channel}
                    />
                );
            }

            if (this.state.showEditChannelPurposeModal) {
                editChannelPurposeModal = (
                    <EditChannelPurposeModal
                        onModalDismissed={this.hideChannelPurposeModal}
                        channel={channel}
                    />
                );
            }

            renameChannelModal = (
                <RenameChannelModal
                    show={this.state.showRenameChannelModal}
                    onHide={this.hideRenameChannelModal}
                    channel={channel}
                />
            );

            if (this.state.showMembersModal) {
                channelMembersModal = (
                    <ChannelMembersModal
                        onModalDismissed={this.hideMembersModal}
                        showInviteModal={this.showChannelInviteModalButton}
                        channel={channel}
                    />
                );
            }

            channelNotificationsModal = (
                <ChannelNotificationsModal
                    show={this.state.showChannelNotificationsModal}
                    onHide={this.hideChannelNotificationsModal}
                    channel={channel}
                    channelMember={this.state.member}
                    currentUser={this.state.currentUser}
                />
            );

            quickSwitchModal = (
                <QuickSwitchModal
                    show={this.state.showQuickSwitchModal}
                    onHide={this.hideQuickSwitchModal}
                    initialMode={this.state.quickSwitchMode}
                />
            );
        }

        var collapseButtons = this.createCollapseButtons(currentId);

        const searchButton = (
            <button
                type='button'
                className='navbar-toggle navbar-right__icon navbar-search pull-right'
                onClick={this.showSearch}
            >
                <SearchIcon
                    className='icon icon__search'
                    aria-hidden='true'
                />
            </button>
        );

        var channelMenuDropdown = this.createDropdown(teamId, channel, channelTitle, isDirect, isGroup);

        return (
            <div>
                <nav
                    className='navbar navbar-default navbar-fixed-top'
                    role='navigation'
                >
                    <div className='container-fluid theme'>
                        <div className='navbar-header'>
                            {collapseButtons}
                            {searchButton}
                            <NavbarInfoButton
                                ref='headerOverlay'
                                channel={channel}
                                showEditChannelHeaderModal={this.showEditChannelHeaderModal}
                                isReadOnly={this.props.isReadOnly}
                            />
                            <Pluggable pluggableName='MobileChannelHeaderButton'/>
                            {channelMenuDropdown}
                        </div>
                    </div>
                </nav>
                {editChannelHeaderModal}
                {editChannelPurposeModal}
                {renameChannelModal}
                {channelMembersModal}
                {channelNotificationsModal}
                {quickSwitchModal}
            </div>
        );
    }
}
