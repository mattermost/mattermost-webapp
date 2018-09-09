// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Permissions} from 'mattermost-redux/constants';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import * as ChannelActions from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebrtcActions from 'actions/webrtc_actions.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import {Constants, ModalIdentifiers, RHSStates, UserStatuses} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import ConvertChannelModal from 'components/convert_channel_modal';
import DeleteChannelModal from 'components/delete_channel_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
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
import ViewChannelInfoOption from './navbar_dropdown_items/view_channel_info';
import SetChannelHeaderOption from './navbar_dropdown_items/set_channel_header';
import NotificationPreferenceOption from './navbar_dropdown_items/notification_preferences';
import ChannelMembersOption from './navbar_dropdown_items/channel_members';
import ViewPinnedPostsOption from './navbar_dropdown_items/view_pinned_posts';
import AddMembersOption from './navbar_dropdown_items/add_members';

export default class Navbar extends React.PureComponent {
    static propTypes = {

        /**
         * String that is URL of current team
         */
        currentTeamUrl: PropTypes.string.isRequired,

        /**
         * Object with info about current user
         */
        currentUser: PropTypes.object.isRequired,

        /**
         * Object that is map of user id and user status
         */
        userStatuses: PropTypes.object.isRequired,

        /**
         * Object with info about current channel
         */
        channel: PropTypes.object,

        /**
         * Object with info about my membership of current channel
         */
        channelMembership: PropTypes.object.isRequired,

        /**
         * Number that online user count of current channel
         */
        userCount: PropTypes.number,

        /**
         * Bool whether the current channel is default channel
         */
        isDefault: PropTypes.bool,

        /**
         * Bool whether the current channel is read only
         */
        isReadOnly: PropTypes.bool,

        /**
         * Bool whether the current channel is favorite
         */
        isFavorite: PropTypes.bool,

        /**
         * Bool whether the WebRTC feature is enabled
         */
        enableWebrtc: PropTypes.bool.isRequired,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({
            leaveChannel: PropTypes.func.isRequired,
            updateRhsState: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
            toggleLhs: PropTypes.func.isRequired,
            closeLhs: PropTypes.func.isRequired,
            closeRhs: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        const {channel} = props;

        let contactId = null;
        if (channel && channel.type === Constants.DIRECT_CHANNEL) {
            contactId = Utils.getUserIdFromChannelName(channel);
        }

        this.state = {
            contactId,
            isBusy: WebrtcStore.isBusy(),
        };
    }

    componentDidMount() {
        WebrtcStore.addBusyListener(this.onBusy);
        $('.inner-wrap').on('click', this.hideSidebars);
    }

    componentWillUnmount() {
        WebrtcStore.removeBusyListener(this.onBusy);
        $('.inner-wrap').off('click', this.hideSidebars);
    }

    handleLeave = () => {
        if (this.props.channel.type === Constants.PRIVATE_CHANNEL) {
            GlobalActions.showLeavePrivateChannelModal(this.props.channel);
        } else {
            this.props.actions.leaveChannel(this.props.channel.id);
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

    toggleFavorite = (e) => {
        const {markFavorite, unmarkFavorite} = this.props.actions;
        e.preventDefault();

        if (this.props.isFavorite) {
            ChannelActions.unmarkFavorite(this.props.channel.id);
        } else {
            ChannelActions.markFavorite(this.props.channel.id);
        }
    };

    onBusy = (isBusy) => {
        this.setState({isBusy});
    }

    isContactAvailable() {
        if (this.state.isBusy) {
            return false;
        }

        const contactStatus = this.props.userStatuses[this.state.contactId];
        return !(contactStatus === UserStatuses.OFFLINE || contactStatus === UserStatuses.DND);
    }

    isWebrtcEnabled() {
        return this.props.enableWebrtc && Utils.isUserMediaAvailable();
    }

    initWebrtc = () => {
        if (this.isContactAvailable()) {
            this.props.actions.closeRhs();
            WebrtcActions.initWebrtc(this.state.contactId, true);
        }
    }

    generateWebrtcDropdown() {
        if (!this.isWebrtcEnabled()) {
            return null;
        }

        let linkClass = '';
        if (!this.isContactAvailable()) {
            linkClass = 'disable-links';
        }

        return (
            <li
                role='presentation'
                className='webrtc__option visible-xs-block'
            >
                <button
                    role='menuitem'
                    onClick={this.initWebrtc}
                    className={'style--none ' + linkClass}
                >
                    <FormattedMessage
                        id='navbar_dropdown.webrtc.call'
                        defaultMessage='Start Video Call'
                    />
                </button>
            </li>
        );
    }

    generateWebrtcIcon() {
        if (!this.isWebrtcEnabled() || this.props.channel.type !== Constants.DM_CHANNEL) {
            return null;
        }

        let circleClass = '';
        if (!this.isContactAvailable()) {
            circleClass = 'offline';
        }

        return (
            <div className={'pull-right description navbar-right__icon webrtc__button hidden-xs ' + circleClass}>
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
            let webrtcOption;
            let setChannelPurposeOption;
            let notificationPreferenceOption;
            let renameChannelOption;
            let convertChannelOption;
            let deleteChannelOption;
            let leaveChannelOption;

            let setChannelHeaderOption = <SetChannelHeaderOption channel={channel}/>;
            const channelMembersOption = <ChannelMembersOption channel={channel}/>;
            const viewPinnedPostsOption = <ViewPinnedPostsOption channel={channel}/>;
            const addMembersOption = <AddMembersOption channel={channel}/>;

            if (isDirect) {
                webrtcOption = this.generateWebrtcDropdown();
            } else if (isGroup) {
                notificationPreferenceOption = (
                    <NotificationPreferenceOption
                        user={this.props.currentUser}
                        channel={channel}
                        membership={this.props.channelMembership}
                    />
                );
            } else {
                const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
                viewInfoOption = <ViewChannelInfoOption channel={channel}/>;
                notificationPreferenceOption = (
                    <NotificationPreferenceOption
                        user={this.props.currentUser}
                        channel={channel}
                        membership={this.props.channelMembership}
                    />
                );

                if (!this.props.isReadOnly) {
                    setChannelHeaderOption = (
                        <ChannelPermissionGate
                            channelId={channel.id}
                            teamId={teamId}
                            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                        >
                            <SetChannelHeaderOption channel={channel}/>
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

                    if (!this.props.isDefault && channel.type === Constants.OPEN_CHANNEL) {
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

                if (!this.props.isDefault) {
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
                        {this.props.isFavorite ?
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
                            {channelMembersOption}
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
                    to={`${this.props.currentTeamUrl}/channels/${Constants.DEFAULT_CHANNEL}`}
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
        const {channel, userStatuses} = this.props;

        if (channel && channel.type === 'D') {
            const teammateId = Utils.getUserIdFromChannelName(channel);
            if (teammateId) {
                return userStatuses[teammateId];
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
        const {channel, currentUser} = this.props;

        if (!channel) {
            return null;
        }

        const isDirect = channel.type === Constants.DM_CHANNEL;
        const isGroup = channel.type === Constants.GM_CHANNEL;
        const teamId = channel.team_id;

        let channelTitle = channel.display_name;

        if (isDirect) {
            const teammateId = Utils.getUserIdFromChannelName(channel);
            if (currentUser.id === teammateId) {
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
        }

        const collapseButtons = this.createCollapseButtons(currentUser.id);
        const channelMenuDropdown = this.createDropdown(teamId, channel, channelTitle, isDirect, isGroup);

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
