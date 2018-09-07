// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Permissions} from 'mattermost-redux/constants';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import * as GlobalActions from 'actions/global_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import * as ChannelUtils from 'utils/channel_utils.jsx';
import {Constants, ModalIdentifiers, RHSStates, UserStatuses} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import ConvertChannelModal from 'components/convert_channel_modal';
import ChannelInfoModal from 'components/channel_info_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal';
import ChannelNotificationsModal from 'components/channel_notifications_modal';
import DeleteChannelModal from 'components/delete_channel_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import NotifyCounts from 'components/notify_counts.jsx';
import RenameChannelModal from 'components/rename_channel_modal';
import StatusIcon from 'components/status_icon.jsx';
import MenuIcon from 'components/svg/menu_icon';
import SearchIcon from 'components/svg/search_icon';
import ToggleModalButton from 'components/toggle_modal_button.jsx';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import MobileChannelHeaderPlug from 'plugins/mobile_channel_header_plug';

import NavbarInfoButton from './navbar_info_button';

export default class Navbar extends React.Component {
    static propTypes = {
        teamDisplayName: PropTypes.string,
        isPinnedPosts: PropTypes.bool,
        isReadOnly: PropTypes.bool,
        isFavoriteChannel: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            closeLhs: PropTypes.func.isRequired,
            closeRhs: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
            leaveChannel: PropTypes.func.isRequired,
            markFavorite: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func,
            toggleLhs: PropTypes.func.isRequired,
            toggleRhsMenu: PropTypes.func.isRequired,
            unmarkFavorite: PropTypes.func.isRequired,
            updateChannelNotifyProps: PropTypes.func.isRequired,
            updateRhsState: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        teamDisplayName: '',
    };

    constructor(props) {
        super(props);

        this.state = {
            ...this.getStateFromStores(),
            showQuickSwitchModal: false,
            quickSwitchMode: 'channel',
        };
    }

    componentDidMount() {
        ChannelStore.addChangeListener(this.onChange);
        ChannelStore.addStatsChangeListener(this.onChange);
        UserStore.addStatusesChangeListener(this.onChange);
        UserStore.addChangeListener(this.onChange);
        PreferenceStore.addChangeListener(this.onChange);
        WebrtcStore.addChangedListener(this.onChange);
        WebrtcStore.addBusyListener(this.onBusy);
        $('.inner-wrap').on('click', this.hideSidebars);
    }

    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.onChange);
        ChannelStore.removeStatsChangeListener(this.onChange);
        UserStore.removeStatusesChangeListener(this.onChange);
        UserStore.removeChangeListener(this.onChange);
        PreferenceStore.removeChangeListener(this.onChange);
        WebrtcStore.removeChangedListener(this.onChange);
        WebrtcStore.removeBusyListener(this.onBusy);
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
            contactId,
        };
    }

    isStateValid = () => {
        return this.state.channel && this.state.member && this.state.users && this.state.currentUser;
    }

    handleLeave = () => {
        const {actions} = this.props;
        if (this.state.channel.type === Constants.PRIVATE_CHANNEL) {
            GlobalActions.showLeavePrivateChannelModal(this.state.channel);
        } else {
            actions.leaveChannel(this.state.channel.id);
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

    getPinnedPosts = (e) => {
        e.preventDefault();
        if (this.props.isPinnedPosts) {
            GlobalActions.emitCloseRightHandSide();
        } else {
            this.props.actions.showPinnedPosts(this.state.channel.id);
        }
    }

    toggleFavorite = (e) => {
        const {markFavorite, unmarkFavorite} = this.props.actions;
        e.preventDefault();

        if (this.props.isFavoriteChannel) {
            unmarkFavorite(this.state.channel.id);
        } else {
            markFavorite(this.state.channel.id);
        }
    };

    renderEditChannelHeaderOption = (channel) => {
        if (!channel || !channel.id) {
            return null;
        }

        return (
            <li role='presentation'>
                <ToggleModalButtonRedux
                    id='editChannelHeader'
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
    }

    handleUnmuteChannel = () => {
        const {channel, currentUser} = this.state;

        if (!currentUser || !channel) {
            return;
        }

        const props = {mark_unread: NotificationLevels.ALL};
        this.props.actions.updateChannelNotifyProps(currentUser.id, channel.id, props);
    };

    createDropdown = (teamId, channel, channelTitle, isDirect, isGroup) => {
        if (channel) {
            let viewInfoOption;
            let viewPinnedPostsOption;
            let addMembersOption;
            let manageMembersOption;
            let setChannelHeaderOption;
            let setChannelPurposeOption;
            let notificationPreferenceOption;
            let renameChannelOption;
            let convertChannelOption;
            let deleteChannelOption;
            let leaveChannelOption;

            if (isDirect) {
                setChannelHeaderOption = this.renderEditChannelHeaderOption(channel);
            } else if (isGroup) {
                setChannelHeaderOption = this.renderEditChannelHeaderOption(channel);

                notificationPreferenceOption = (
                    <li role='presentation'>
                        <ToggleModalButtonRedux
                            role='menuitem'
                            modalId={ModalIdentifiers.CHANNEL_NOTIFICATIONS}
                            dialogType={ChannelNotificationsModal}
                            dialogProps={{
                                channel,
                                channelMember: this.state.member,
                                currentUser: this.state.currentUser,
                            }}
                        >
                            <FormattedMessage
                                id='navbar.preferences'
                                defaultMessage='Notification Preferences'
                            />
                        </ToggleModalButtonRedux>
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
                        <button
                            role='menuitem'
                            className='style--none'
                            onClick={this.getPinnedPosts}
                        >
                            <FormattedMessage
                                id='navbar.viewPinnedPosts'
                                defaultMessage='View Pinned Posts'
                            />
                        </button>
                    </li>
                );

                if (ChannelStore.isDefault(channel)) {
                    manageMembersOption = (
                        <li
                            key='view_members'
                            role='presentation'
                        >
                            <ToggleModalButtonRedux
                                role='menuitem'
                                modalId={ModalIdentifiers.CHANNEL_MEMBERS}
                                dialogType={ChannelMembersModal}
                                dialogProps={{channel}}
                            >
                                <FormattedMessage
                                    id='channel_header.viewMembers'
                                    defaultMessage='View Members'
                                />
                            </ToggleModalButtonRedux>
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
                            <ToggleModalButtonRedux
                                role='menuitem'
                                modalId={ModalIdentifiers.CHANNEL_MEMBERS}
                                dialogType={ChannelMembersModal}
                                dialogProps={{channel}}
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
                            </ToggleModalButtonRedux>
                        </li>
                    );
                }

                notificationPreferenceOption = (
                    <li role='presentation'>
                        <ToggleModalButtonRedux
                            role='menuitem'
                            modalId={ModalIdentifiers.CHANNEL_NOTIFICATIONS}
                            dialogType={ChannelNotificationsModal}
                            dialogProps={{
                                channel,
                                channelMember: this.state.member,
                                currentUser: this.state.currentUser,
                            }}
                        >
                            <FormattedMessage
                                id='navbar.preferences'
                                defaultMessage='Notification Preferences'
                            />
                        </ToggleModalButtonRedux>
                    </li>
                );

                if (!this.props.isReadOnly) {
                    setChannelHeaderOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            {this.renderEditChannelHeaderOption(channel)}
                        </ChannelPermissionGate>
                    );

                    setChannelPurposeOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <li role='presentation'>
                                <ToggleModalButtonRedux
                                    role='menuitem'
                                    modalId={ModalIdentifiers.EDIT_CHANNEL_PURPOSE}
                                    dialogType={EditChannelPurposeModal}
                                    dialogProps={{channel}}
                                >
                                    <FormattedMessage
                                        id='channel_header.setPurpose'
                                        defaultMessage='Edit Channel Purpose'
                                    />
                                </ToggleModalButtonRedux>
                            </li>
                        </ChannelPermissionGate>
                    );

                    if (!ChannelStore.isDefault(channel) && channel.type === Constants.OPEN_CHANNEL) {
                        convertChannelOption = (
                            <TeamPermissionGate
                                teamId={teamId}
                                permissions={[Permissions.MANAGE_TEAM]}
                            >
                                <li role='presentation'>
                                    <ToggleModalButton
                                        role='menuitem'
                                        dialogType={ConvertChannelModal}
                                        dialogProps={{
                                            channelId: channel.id,
                                            channelDisplayName: channel.display_name,
                                        }}
                                    >
                                        <FormattedMessage
                                            id='channel_header.convert'
                                            defaultMessage='Convert to Private Channel'
                                        />
                                    </ToggleModalButton>
                                </li>
                            </TeamPermissionGate>
                        );
                    }

                    renameChannelOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <li role='presentation'>
                                <ToggleModalButtonRedux
                                    role='menuitem'
                                    modalId={ModalIdentifiers.RENAME_CHANNEL}
                                    dialogType={RenameChannelModal}
                                    dialogProps={{channel}}
                                >
                                    <FormattedMessage
                                        id='channel_header.rename'
                                        defaultMessage='Rename Channel'
                                    />
                                </ToggleModalButtonRedux>
                            </li>
                        </ChannelPermissionGate>
                    );
                }

                if (!ChannelStore.isDefault(channel)) {
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
                                        defaultMessage='Archive Channel'
                                    />
                                </ToggleModalButton>
                            </li>
                        </ChannelPermissionGate>
                    );

                    leaveChannelOption = (
                        <li role='presentation'>
                            <button
                                role='menuitem'
                                className='style--none'
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

            const toggleFavoriteOption = (
                <li
                    key='toggle_favorite'
                    role='presentation'
                >
                    <button
                        role='menuitem'
                        className='style--none'
                        onClick={this.toggleFavorite}
                    >
                        {this.props.isFavoriteChannel ?
                            <FormattedMessage
                                id='channelHeader.removeFromFavorites'
                                defaultMessage='Remove from Favorites'
                            /> :
                            <FormattedMessage
                                id='channelHeader.addToFavorites'
                                defaultMessage='Add to Favorites'
                            />}
                    </button>
                </li>
            );

            const channelMuted = isChannelMuted(this.state.member);

            return (
                <div className='navbar-brand'>
                    <div className='dropdown'>
                        <a
                            href='#'
                            className='dropdown-toggle theme'
                            type='button'
                            aria-expanded='true'
                            data-toggle='dropdown'
                        >
                            <span className='heading'><StatusIcon status={this.getTeammateStatus()}/>{channelTitle} </span>
                            <span
                                className='fa fa-angle-down header-dropdown__icon'
                                title={Utils.localizeMessage('generic_icons.dropdown', 'Dropdown Icon')}
                            />
                        </a>
                        <ul
                            className='dropdown-menu'
                            role='menu'
                        >
                            {viewInfoOption}
                            {viewPinnedPostsOption}
                            {notificationPreferenceOption}
                            {addMembersOption}
                            {manageMembersOption}
                            {setChannelHeaderOption}
                            {setChannelPurposeOption}
                            {renameChannelOption}
                            {convertChannelOption}
                            {deleteChannelOption}
                            {leaveChannelOption}
                            {toggleFavoriteOption}
                            <li className='dropdown-item__plugin'>
                                <MobileChannelHeaderPlug
                                    channel={channel}
                                    isDropdown={false}
                                />
                            </li>
                            <div className='close visible-xs-block'>
                                {'×'}
                            </div>
                        </ul>
                    </div>
                    {channelMuted &&
                        <button
                            type='button'
                            className='navbar-toggle icon icon__mute'
                            onClick={this.handleUnmuteChannel}
                        >
                            <span className='fa fa-bell-slash-o icon'/>
                        </button>
                    }
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

    createLhsButton = (currentId) => {
        let lhsButton;

        if (currentId == null) {
            lhsButton = (
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
            lhsButton = (
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
        }

        return lhsButton;
    }

    createRhsButton = (currentId) => {
        let rhsButton;
        if (currentId != null) {
            rhsButton = (
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

        return rhsButton;
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
        }

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

        const channelMenuDropdown = this.createDropdown(teamId, channel, channelTitle, isDirect, isGroup);

        return (
            <div>
                <nav
                    className='navbar navbar-default navbar-fixed-top'
                    role='navigation'
                >
                    <div className='container-fluid theme'>
                        <div className='navbar-header'>
                            {this.createLhsButton(currentId)}
                            {channelMenuDropdown}
                            <NavbarInfoButton
                                ref='headerOverlay'
                                channel={channel}
                                showEditChannelHeaderModal={this.showEditChannelHeaderModal}
                                isReadOnly={this.props.isReadOnly}
                            />
                            {searchButton}
                            {this.createRhsButton(currentId)}
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}
