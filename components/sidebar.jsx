// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import {browserHistory} from 'react-router';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getChannelsByCategory, getAllChannels} from 'mattermost-redux/selectors/entities/channels';

import * as ChannelActions from 'actions/channel_actions.jsx';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import ModalStore from 'stores/modal_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import * as ChannelUtils from 'utils/channel_utils.jsx';
import {
    ActionTypes,
    Constants,
    Preferences,
    TutorialSteps
} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import favicon from 'images/favicon/favicon-16x16.png';
import redFavicon from 'images/favicon/redfavicon-16x16.png';

import MoreChannels from 'components/more_channels';
import MoreDirectChannels from 'components/more_direct_channels';

import ArchiveIcon from 'components/svg/archive_icon';
import GlobeIcon from 'components/svg/globe_icon';
import LockIcon from 'components/svg/lock_icon';
import NewChannelFlow from './new_channel_flow.jsx';
import SidebarHeader from './sidebar_header.jsx';
import UnreadChannelIndicator from './unread_channel_indicator.jsx';
import SidebarChannel from './sidebar/sidebar_channel.jsx';

const Preferences = Constants.Preferences;
const TutorialSteps = Constants.TutorialSteps;

const dispatch = store.dispatch;
const getState = store.getState;

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.badgesActive = false;
        this.firstUnreadChannel = null;
        this.lastUnreadChannel = null;

        this.isLeaving = new Map();
        this.isSwitchingChannel = false;
        this.closedDirectChannel = false;

        const state = this.getStateFromStores();
        state.newChannelModalType = '';
        state.showDirectChannelsModal = false;
        state.showMoreChannelsModal = false;
        state.loadingDMChannel = -1;
        state.inChannelChange = false;
        this.state = state;
    }

    getTotalUnreadCount = () => {
        const unreads = ChannelUtils.getCountsStateFromStores(this.state.currentTeam, this.state.teamMembers, this.state.unreadCounts);
        return {msgs: unreads.messageCount, mentions: unreads.mentionCount};
    }

    getStateFromStores = () => {
        const members = ChannelStore.getMyMembers();
        const teamMembers = TeamStore.getMyTeamMembers();
        const currentChannelId = ChannelStore.getCurrentId();
        const tutorialStep = PreferenceStore.getInt(Preferences.TUTORIAL_STEP, UserStore.getCurrentId(), 999);

        const displayableChannels = getChannelsByCategory(store.getState());

        return {
            activeId: currentChannelId,
            members,
            teamMembers,
            ...displayableChannels,
            unreadCounts: JSON.parse(JSON.stringify(ChannelStore.getUnreadCounts())),
            showTutorialTip: tutorialStep === TutorialSteps.CHANNEL_POPOVER && global.window.mm_config.EnableTutorial === 'true',
            currentTeam: TeamStore.getCurrent(),
            currentUser: UserStore.getCurrentUser(),
            townSquare: ChannelStore.getByName(Constants.DEFAULT_CHANNEL),
            offTopic: ChannelStore.getByName(Constants.OFFTOPIC_CHANNEL),
            allChannels: getAllChannels(store.getState())
        };
    }

    onInChannelChange = () => {
        this.setState({inChannelChange: !this.state.inChannelChange});
    }

    componentDidMount() {
        ChannelStore.addChangeListener(this.onChange);
        UserStore.addChangeListener(this.onChange);
        UserStore.addInTeamChangeListener(this.onChange);
        UserStore.addInChannelChangeListener(this.onInChannelChange);
        UserStore.addStatusesChangeListener(this.onChange);
        TeamStore.addChangeListener(this.onChange);
        PreferenceStore.addChangeListener(this.onChange);
        ModalStore.addModalListener(ActionTypes.TOGGLE_DM_MODAL, this.onModalChange);

        this.updateTitle();
        this.updateUnreadIndicators();

        document.addEventListener('keydown', this.navigateChannelShortcut);
        document.addEventListener('keydown', this.navigateUnreadChannelShortcut);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!Utils.areObjectsEqual(nextState, this.state)) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        // if the active channel disappeared (which can happen when dm channels autoclose), go to town square
        if (this.state.currentTeam === prevState.currentTeam &&
            this.state.activeId === prevState.activeId &&
            !this.channelIdIsDisplayedForState(this.state, this.state.activeId) &&
            this.channelIdIsDisplayedForState(prevState, this.state.activeId)
        ) {
            this.closedDirectChannel = true;
            browserHistory.push('/' + this.state.currentTeam.name + '/channels/town-square');
            return;
        }

        this.updateTitle();
        this.updateUnreadIndicators();
        if (!Utils.isMobile()) {
            $('.sidebar--left .nav-pills__container').perfectScrollbar();
        }

        // reset the scrollbar upon switching teams
        if (this.state.currentTeam !== prevState.currentTeam) {
            this.refs.container.scrollTop = 0;
            $('.nav-pills__container').perfectScrollbar('update');
        }

        // close the LHS on mobile when you change channels
        if (this.state.activeId !== prevState.activeId) {
            if (this.closedDirectChannel) {
                this.closedDirectChannel = false;
            } else {
                $('.app__body .inner-wrap').removeClass('move--right');
                $('.app__body .sidebar--left').removeClass('move--right');
                $('.multi-teams .team-sidebar').removeClass('move--right');
            }
        }
    }

    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.onChange);
        UserStore.removeChangeListener(this.onChange);
        UserStore.removeInTeamChangeListener(this.onChange);
        UserStore.removeInChannelChangeListener(this.onChange);
        UserStore.removeStatusesChangeListener(this.onChange);
        TeamStore.removeChangeListener(this.onChange);
        PreferenceStore.removeChangeListener(this.onChange);
        ModalStore.removeModalListener(ActionTypes.TOGGLE_DM_MODAL, this.onModalChange);
        document.removeEventListener('keydown', this.navigateChannelShortcut);
        document.removeEventListener('keydown', this.navigateUnreadChannelShortcut);
    }

    onModalChange = (value, args) => {
        this.showMoreDirectChannelsModal(UserStore.getProfileListInChannel(args.channelId, true, false));
    }

    handleOpenMoreDirectChannelsModal = (e) => {
        e.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
        }
    }

    onChange = () => {
        if (this.state.currentTeam.id !== TeamStore.getCurrentId()) {
            ChannelStore.clear();
        }
        this.setState(this.getStateFromStores());
        this.updateTitle();
    }

    updateTitle = () => {
        const channel = ChannelStore.getCurrent();
        if (channel && this.state.currentTeam) {
            let currentSiteName = '';
            if (global.window.mm_config.SiteName != null) {
                currentSiteName = global.window.mm_config.SiteName;
            }

            let currentChannelName = channel.display_name;
            if (channel.type === Constants.DM_CHANNEL) {
                const teammate = Utils.getDirectTeammate(channel.id);
                if (teammate != null) {
                    currentChannelName = teammate.username;
                }
            }

            const unread = this.getTotalUnreadCount();
            const mentionTitle = unread.mentions > 0 ? '(' + unread.mentions + ') ' : '';
            const unreadTitle = unread.msgs > 0 ? '* ' : '';
            document.title = mentionTitle + unreadTitle + currentChannelName + ' - ' + this.state.currentTeam.display_name + ' ' + currentSiteName;
        }
    }

    onScroll = () => {
        this.updateUnreadIndicators();
    }

    scrollToFirstUnreadChannel = () => {
        if (this.firstUnreadChannel) {
            const unreadMargin = 15;
            const container = $(ReactDOM.findDOMNode(this.refs.container));
            const firstUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.firstUnreadChannel]));
            const scrollTop = (container.scrollTop() + firstUnreadElement.position().top) - unreadMargin;
            container.stop().animate({scrollTop}, 500, 'swing');
        }
    }

    scrollToLastUnreadChannel = () => {
        if (this.lastUnreadChannel) {
            const unreadMargin = 15;
            const container = $(ReactDOM.findDOMNode(this.refs.container));
            const lastUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.lastUnreadChannel]));
            const elementBottom = lastUnreadElement.position().top + lastUnreadElement.height();
            const scrollTop = (container.scrollTop() + (elementBottom - container.height())) + unreadMargin;
            container.stop().animate({scrollTop}, 500, 'swing');
        }
    }

    updateUnreadIndicators = () => {
        const container = $(ReactDOM.findDOMNode(this.refs.container));

        var showTopUnread = false;
        var showBottomUnread = false;

        // Consider partially obscured channels as above/below
        const unreadMargin = 15;

        if (this.firstUnreadChannel) {
            var firstUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.firstUnreadChannel]));

            if (firstUnreadElement.position().top + firstUnreadElement.height() < unreadMargin) {
                showTopUnread = true;
            }
        }

        if (this.lastUnreadChannel) {
            var lastUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.lastUnreadChannel]));

            if (lastUnreadElement.position().top > container.height() - unreadMargin) {
                showBottomUnread = true;
            }
        }

        this.setState({
            showTopUnread,
            showBottomUnread
        });
    }

    updateScrollbarOnChannelChange = (channel) => {
        const curChannel = this.refs[channel.name].getBoundingClientRect();
        if ((curChannel.top - Constants.CHANNEL_SCROLL_ADJUSTMENT < 0) || (curChannel.top + curChannel.height > this.refs.container.getBoundingClientRect().height)) {
            this.refs.container.scrollTop = this.refs.container.scrollTop + (curChannel.top - Constants.CHANNEL_SCROLL_ADJUSTMENT);
            $('.nav-pills__container').perfectScrollbar('update');
        }
    }

    navigateChannelShortcut = (e) => {
        if (e.altKey && !e.shiftKey && (e.keyCode === Constants.KeyCodes.UP || e.keyCode === Constants.KeyCodes.DOWN)) {
            e.preventDefault();

            if (this.isSwitchingChannel) {
                return;
            }

            this.isSwitchingChannel = true;
            const allChannels = this.getDisplayedChannels();
            const curChannelId = this.state.activeId;
            let curIndex = -1;
            for (let i = 0; i < allChannels.length; i++) {
                if (allChannels[i].id === curChannelId) {
                    curIndex = i;
                }
            }
            let nextIndex = curIndex;
            if (e.keyCode === Constants.KeyCodes.DOWN) {
                nextIndex = curIndex + 1;
            } else if (e.keyCode === Constants.KeyCodes.UP) {
                nextIndex = curIndex - 1;
            }
            const nextChannel = allChannels[Utils.mod(nextIndex, allChannels.length)];
            ChannelActions.goToChannel(nextChannel);
            this.updateScrollbarOnChannelChange(nextChannel);
            this.isSwitchingChannel = false;
        } else if (Utils.cmdOrCtrlPressed(e) && e.shiftKey && e.keyCode === Constants.KeyCodes.K) {
            this.handleOpenMoreDirectChannelsModal(e);
        }
    }

    navigateUnreadChannelShortcut = (e) => {
        if (e.altKey && e.shiftKey && (e.keyCode === Constants.KeyCodes.UP || e.keyCode === Constants.KeyCodes.DOWN)) {
            e.preventDefault();

            if (this.isSwitchingChannel) {
                return;
            }

            this.isSwitchingChannel = true;
            const allChannels = this.getDisplayedChannels();
            const curChannelId = this.state.activeId;
            let curIndex = -1;
            for (let i = 0; i < allChannels.length; i++) {
                if (allChannels[i].id === curChannelId) {
                    curIndex = i;
                }
            }
            let nextIndex = curIndex;
            let count = 0;
            let increment = 0;
            if (e.keyCode === Constants.KeyCodes.UP) {
                increment = -1;
            } else if (e.keyCode === Constants.KeyCodes.DOWN) {
                increment = 1;
            }
            let unreadCounts = ChannelStore.getUnreadCount(allChannels[nextIndex].id);
            while (count < allChannels.length && unreadCounts.msgs === 0 && unreadCounts.mentions === 0) {
                nextIndex += increment;
                count++;
                nextIndex = Utils.mod(nextIndex, allChannels.length);
                unreadCounts = ChannelStore.getUnreadCount(allChannels[nextIndex].id);
            }
            if (unreadCounts.msgs !== 0 || unreadCounts.mentions !== 0) {
                const nextChannel = allChannels[nextIndex];
                ChannelActions.goToChannel(nextChannel);
                this.updateScrollbarOnChannelChange(nextChannel);
            }
            this.isSwitchingChannel = false;
        }
    }

    getDisplayedChannels = () => {
        return this.getDisplayedChannelsForState(this.state);
    }

    getDisplayedChannelsForState = (state) => {
        return state.favoriteChannels.concat(state.publicChannels).concat(state.privateChannels).concat(state.directAndGroupChannels);
    }

    channelIdIsDisplayedForState = (state, id) => {
        const allChannels = this.getDisplayedChannelsForState(state);
        for (let i = 0; i < allChannels.length; i++) {
            if (allChannels[i].id === id) {
                return true;
            }
        }
        return false;
    }

    handleLeavePublicChannel = (e, channelId) => {
        e.preventDefault();
        ChannelActions.leaveChannel(channelId);
        trackEvent('ui', 'ui_public_channel_x_button_clicked');
    }

    handleLeavePrivateChannel = (e, channelId) => {
        e.preventDefault();
        const channel = this.state.allChannels[channelId];
        GlobalActions.showLeavePrivateChannelModal(channel);
        trackEvent('ui', 'ui_private_channel_x_button_clicked');
    }

    handleLeaveDirectChannel = (e, channelId) => {
        e.preventDefault();
        const channel = this.state.allChannels[channelId];

        if (!this.isLeaving.get(channel.id)) {
            this.isLeaving.set(channel.id, true);

            let id;
            let category;
            if (channel.type === Constants.DM_CHANNEL) {
                const teammate = Utils.getDirectTeammate(channel.id);
                id = teammate.id;
                category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;
            } else {
                id = channel.id;
                category = Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW;
            }

            const currentUserId = this.state.currentUser.id;
            savePreferences(currentUserId, [{user_id: currentUserId, category, name: id, value: 'false'}])(dispatch, getState).then(
                () => {
                    this.isLeaving.set(channel.id, false);
                }
            );

            this.setState(this.getStateFromStores());
            trackEvent('ui', 'ui_direct_channel_x_button_clicked');
        }

        if (channel.id === this.state.activeId) {
            this.closedDirectChannel = true;
            browserHistory.push('/' + this.state.currentTeam.name + '/channels/town-square');
        }
    }

    showMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_public');
    }

    hideMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: false});
    }

    showNewChannelModal = (type) => {
        this.setState({newChannelModalType: type});
    }

    hideNewChannelModal = () => {
        this.setState({newChannelModalType: ''});
    }

    showMoreDirectChannelsModal = (startingUsers) => {
        trackEvent('ui', 'ui_channels_more_direct');
        this.setState({showDirectChannelsModal: true, startingUsers});
    }

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false, startingUsers: null});
    }

    openQuickSwitcher = (e) => {
        e.preventDefault();
        AppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_QUICK_SWITCH_MODAL
        });
    }

    createSidebarChannel = (channel, index, closeHandler) => {
        if (channel.id === this.state.activeId) {
            if (!this.firstUnreadChannel) {
                this.firstUnreadChannel = channel.name;
            }
            this.lastUnreadChannel = channel.name;
        }

        const unreadCount = this.state.unreadCounts[channel.id] || {msgs: 0, mentions: 0};
        if (this.state.members[channel.id] && unreadCount.mentions) {
            this.badgesActive = true;
        }

        const teammate = Utils.getDirectTeammate(channel.id);
        return (
            <SidebarChannel
                key={channel.id}
                ref={channel.name}
                channelDisplayName={channel.display_name}
                channelName={channel.name}
                channelId={channel.id}
                channelStatus={channel.status}
                channelType={channel.type}
                channelFake={channel.fake}
                channelTeammateId={teammate.id}
                channelTeammateDeletedAt={teammate.deleted_at}
                stringifiedChannel={JSON.stringify(channel)}
                index={index}
                handleClose={closeHandler}
                unreadMsgs={unreadCount.msgs}
                unreadMentions={unreadCount.mentions}
                membership={this.state.members[channel.id]}
                active={channel.id === this.state.activeId}
                loadingDMChannel={this.state.loadingDMChannel === index && channel.type === Constants.DM_CHANNEL}
                currentTeamName={this.state.currentTeam.name}
                currentUserId={this.state.currentUser.id}
                showTutorialTip={this.state.showTutorialTip}
                membersCount={UserStore.getProfileListInChannel(channel.id, true).length}
                townSquareDisplayNanme={this.state.townSquare && this.state.townSquare.display_name}
                offTopicDisplayNanme={this.state.offTopic && this.state.offTopic.display_name}
            />
        );
    }

    render() {
        // Check if we have all info needed to render
        if (this.state.currentTeam == null || this.state.currentUser == null) {
            return (<div/>);
        }

        this.lastBadgesActive = this.badgesActive;
        this.badgesActive = false;

        // keep track of the first and last unread channels so we can use them to set the unread indicators
        this.firstUnreadChannel = null;
        this.lastUnreadChannel = null;

        // create elements for all 4 types of channels
        const visibleFavoriteChannels = this.state.favoriteChannels.filter(ChannelUtils.isChannelVisible);

        const favoriteItems = visibleFavoriteChannels.
            map((channel, index) => {
                if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                    return this.createSidebarChannel(channel, index, this.handleLeaveDirectChannel);
                } else if (global.window.mm_config.EnableXToLeaveChannelsFromLHS === 'true') {
                    if (channel.type === Constants.OPEN_CHANNEL && channel.name !== Constants.DEFAULT_CHANNEL) {
                        return this.createSidebarChannel(channel, index, this.handleLeavePublicChannel);
                    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
                        return this.createSidebarChannel(channel, index, this.handleLeavePrivateChannel);
                    }
                }

                return this.createSidebarChannel(channel, index);
            });

        const publicChannelItems = this.state.publicChannels.map((channel, index) => {
            if (global.window.mm_config.EnableXToLeaveChannelsFromLHS !== 'true' ||
                channel.name === Constants.DEFAULT_CHANNEL
            ) {
                return this.createSidebarChannel(channel, index);
            }
            return this.createSidebarChannel(channel, index, this.handleLeavePublicChannel);
        });

        const privateChannelItems = this.state.privateChannels.map((channel, index) => {
            if (global.window.mm_config.EnableXToLeaveChannelsFromLHS !== 'true') {
                return this.createSidebarChannel(channel, index);
            }
            return this.createSidebarChannel(channel, index, this.handleLeavePrivateChannel);
        });

        const directMessageItems = this.state.directAndGroupChannels.map((channel, index) => {
            return this.createSidebarChannel(channel, index, this.handleLeaveDirectChannel);
        });

        // update the favicon to show if there are any notifications
        if (this.lastBadgesActive !== this.badgesActive) {
            var link = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.id = 'favicon';
            if (this.badgesActive) {
                link.href = redFavicon;
            } else {
                link.href = favicon;
            }
            var head = document.getElementsByTagName('head')[0];
            var oldLink = document.getElementById('favicon');
            if (oldLink) {
                head.removeChild(oldLink);
            }
            head.appendChild(link);
        }

        var directMessageMore = (
            <li key='more'>
                <button
                    id='moreDirectMessage'
                    className='nav-more cursor--pointer style--none btn--block'
                    onClick={this.handleOpenMoreDirectChannelsModal}
                >
                    <FormattedMessage
                        id='sidebar.moreElips'
                        defaultMessage='More...'
                    />
                </button>
            </li>
        );

        let showChannelModal = false;
        if (this.state.newChannelModalType !== '') {
            showChannelModal = true;
        }

        const createChannelTootlip = (
            <Tooltip id='new-channel-tooltip' >
                <FormattedMessage
                    id='sidebar.createChannel'
                    defaultMessage='Create new public channel'
                />
            </Tooltip>
        );
        const createGroupTootlip = (
            <Tooltip id='new-group-tooltip'>
                <FormattedMessage
                    id='sidebar.createGroup'
                    defaultMessage='Create new private channel'
                />
            </Tooltip>
        );

        const createDirectMessageTooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id='sidebar.createDirectMessage'
                    defaultMessage='Create new direct message'
                />
            </Tooltip>
        );

        const above = (
            <FormattedMessage
                id='sidebar.unreads'
                defaultMessage='More unreads'
            />
        );

        const below = (
            <FormattedMessage
                id='sidebar.unreads'
                defaultMessage='More unreads'
            />
        );

        const isTeamAdmin = TeamStore.isTeamAdminForCurrentTeam();
        const isSystemAdmin = UserStore.isSystemAdminForCurrentUser();

        let createPublicChannelIcon = (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                delayShow={500}
                placement='top'
                overlay={createChannelTootlip}
            >
                <button
                    id='createPublicChannel'
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={this.showNewChannelModal.bind(this, Constants.OPEN_CHANNEL)}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );

        let createPrivateChannelIcon = (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                delayShow={500}
                placement='top'
                overlay={createGroupTootlip}
            >
                <button
                    id='createPrivateChannel'
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={this.showNewChannelModal.bind(this, Constants.PRIVATE_CHANNEL)}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );

        if (!ChannelUtils.showCreateOption(Constants.OPEN_CHANNEL, isTeamAdmin, isSystemAdmin)) {
            createPublicChannelIcon = null;
        }

        const createDirectMessageIcon = (
            <OverlayTrigger
                className='hidden-xs'
                delayShow={500}
                placement='top'
                overlay={createDirectMessageTooltip}
            >
                <button
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={this.handleOpenMoreDirectChannelsModal}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );

        if (!ChannelUtils.showCreateOption(Constants.PRIVATE_CHANNEL, isTeamAdmin, isSystemAdmin)) {
            createPrivateChannelIcon = null;
        }

        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.hideMoreDirectChannelsModal}
                    startingUsers={this.state.startingUsers}
                />
            );
        }

        let moreChannelsModal;
        if (this.state.showMoreChannelsModal) {
            moreChannelsModal = (
                <MoreChannels
                    onModalDismissed={this.hideMoreChannelsModal}
                    handleNewChannel={() => {
                        this.hideMoreChannelsModal();
                        this.showNewChannelModal(Constants.OPEN_CHANNEL);
                    }}
                />
            );
        }

        let quickSwitchTextShortcutId = 'quick_switch_modal.channelsShortcut.windows';
        let quickSwitchTextShortcutDefault = '- CTRL+K';
        if (Utils.isMac()) {
            quickSwitchTextShortcutId = 'quick_switch_modal.channelsShortcut.mac';
            quickSwitchTextShortcutDefault = '- ⌘K';
        }

        const quickSwitchTextShortcut = (
            <span className='switch__shortcut hidden-xs'>
                <FormattedMessage
                    id={quickSwitchTextShortcutId}
                    defaultMessage={quickSwitchTextShortcutDefault}
                />
            </span>
        );

        return (
            <div
                className='sidebar--left'
                id='sidebar-left'
                key='sidebar-left'
            >
                <NewChannelFlow
                    show={showChannelModal}
                    channelType={this.state.newChannelModalType}
                    onModalDismissed={this.hideNewChannelModal}
                />
                {moreDirectChannelsModal}
                {moreChannelsModal}

                <SidebarHeader
                    teamDisplayName={this.state.currentTeam.display_name}
                    teamDescription={this.state.currentTeam.description}
                    teamName={this.state.currentTeam.name}
                    teamType={this.state.currentTeam.type}
                    currentUser={this.state.currentUser}
                />

                <UnreadChannelIndicator
                    name='Top'
                    show={this.state.showTopUnread}
                    onClick={this.scrollToFirstUnreadChannel}
                    extraClass='nav-pills__unread-indicator-top'
                    content={above}
                />
                <UnreadChannelIndicator
                    name='Bottom'
                    show={this.state.showBottomUnread}
                    onClick={this.scrollToLastUnreadChannel}
                    extraClass='nav-pills__unread-indicator-bottom'
                    content={below}
                />

                <div
                    id='sidebarChannelContainer'
                    ref='container'
                    className='nav-pills__container'
                    onScroll={this.onScroll}
                >
                    {favoriteItems.length !== 0 && <ul className='nav nav-pills nav-stacked'>
                        <li>
                            <h4 id='favoriteChannel'>
                                <FormattedMessage
                                    id='sidebar.favorite'
                                    defaultMessage='FAVORITE CHANNELS'
                                />
                            </h4>
                        </li>
                        {favoriteItems}
                    </ul>}
                    <ul className='nav nav-pills nav-stacked'>
                        <li>
                            <h4 id='publicChannel'>
                                <FormattedMessage
                                    id='sidebar.channels'
                                    defaultMessage='PUBLIC CHANNELS'
                                />
                                {createPublicChannelIcon}
                            </h4>
                        </li>
                        {publicChannelItems}
                        <li>
                            <button
                                id='sidebarChannelsMore'
                                className='nav-more cursor--pointer style--none btn--block'
                                onClick={this.showMoreChannelsModal}
                            >
                                <FormattedMessage
                                    id='sidebar.moreElips'
                                    defaultMessage='More...'
                                />
                            </button>
                        </li>
                    </ul>

                    <ul className='nav nav-pills nav-stacked'>
                        <li>
                            <h4 id='privateChannel'>
                                <FormattedMessage
                                    id='sidebar.pg'
                                    defaultMessage='PRIVATE CHANNELS'
                                />
                                {createPrivateChannelIcon}
                            </h4>
                        </li>
                        {privateChannelItems}
                    </ul>
                    <ul className='nav nav-pills nav-stacked'>
                        <li>
                            <h4 id='directChannel'>
                                <FormattedMessage
                                    id='sidebar.direct'
                                    defaultMessage='DIRECT MESSAGES'
                                />
                                {createDirectMessageIcon}
                            </h4>
                        </li>
                        {directMessageItems}
                        {directMessageMore}
                    </ul>
                </div>
                <div className='sidebar__switcher'>
                    <button
                        id='sidebarSwitcherButton'
                        className='btn btn-link'
                        onClick={this.openQuickSwitcher}
                    >
                        <FormattedMessage
                            id={'channel_switch_modal.title'}
                            defaultMessage='Switch Channels'
                        />
                        {quickSwitchTextShortcut}
                    </button>
                </div>
            </div>
        );
    }
}
