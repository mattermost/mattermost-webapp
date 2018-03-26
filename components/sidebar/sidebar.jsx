// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import {PropTypes} from 'prop-types';

import {browserHistory} from 'utils/browser_history';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import * as ChannelUtils from 'utils/channel_utils.jsx';
import {ActionTypes, Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import favicon from 'images/favicon/favicon-16x16.png';
import redFavicon from 'images/favicon/redfavicon-16x16.png';
import MoreChannels from 'components/more_channels';
import MoreDirectChannels from 'components/more_direct_channels';

import NewChannelFlow from '../new_channel_flow.jsx';
import UnreadChannelIndicator from '../unread_channel_indicator.jsx';

import SidebarHeader from './header';
import SidebarChannel from './sidebar_channel';

export default class Sidebar extends React.PureComponent {
    static propTypes = {

        /**
         * Global config object
         */
        config: PropTypes.object.isRequired,

        /**
         * List of public channels (ids)
         */
        publicChannelIds: PropTypes.array.isRequired,

        /**
         * List of private channels (ids)
         */
        privateChannelIds: PropTypes.array.isRequired,

        /**
         * List of favorite channels (ids)
         */
        favoriteChannelIds: PropTypes.array.isRequired,

        /**
         * List of direct/group channels (ids)
         */
        directAndGroupChannelIds: PropTypes.array.isRequired,

        /**
         * List of unread channels (ids)
         */
        unreadChannelIds: PropTypes.array.isRequired,

        /**
         * Current channel object
         */
        currentChannel: PropTypes.object,

        /**
         * Current channel teammeat (for direct messages)
         */
        currentTeammate: PropTypes.object,

        /**
         * Current team object
         */
        currentTeam: PropTypes.object.isRequired,

        /**
         * Current user object
         */
        currentUser: PropTypes.object.isRequired,

        /**
         * Number of unread mentions/messages
         */
        unreads: PropTypes.object.isRequired,

        /**
         * Flag to display the Unread channels section
         */
        showUnreadSection: PropTypes.bool.isRequired,

        /**
         * Flag to display the option to create public channels.
         */
        showCreatePublicChannelOption: PropTypes.bool.isRequired,

        /**
         * Flag to display the option to create private channels.
         */
        showCreatePrivateChannelOption: PropTypes.bool.isRequired,

        actions: PropTypes.shape({
            goToChannelById: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        currentChannel: {},
    }

    constructor(props) {
        super(props);

        this.badgesActive = false;
        this.firstUnreadChannel = null;
        this.lastUnreadChannel = null;

        this.isLeaving = new Map();
        this.isSwitchingChannel = false;
        this.closedDirectChannel = false;

        this.state = {
            newChannelModalType: '',
            showDirectChannelsModal: false,
            showMoreChannelsModal: false,
        };
    }

    componentDidMount() {
        this.updateUnreadIndicators();
        document.addEventListener('keydown', this.navigateChannelShortcut);
        document.addEventListener('keydown', this.navigateUnreadChannelShortcut);
    }

    componentWillUpdate() {
        this.updateUnreadIndicators();
    }

    componentDidUpdate(prevProps) {
        // if the active channel disappeared (which can happen when dm channels autoclose), go to town square
        if (this.props.currentTeam === prevProps.currentTeam &&
            this.props.currentChannel.id === prevProps.currentChannel.id &&
            !this.channelIdIsDisplayedForProps(this.props, this.props.currentChannel.id) &&
            this.channelIdIsDisplayedForProps(prevProps, this.props.currentChannel.id)
        ) {
            this.closedDirectChannel = true;
            browserHistory.push(`/${this.props.currentTeam.name}/channels/${Constants.DEFAULT_CHANNEL}`);
            return;
        }

        if (!Utils.isMobile()) {
            $('.sidebar--left .nav-pills__container').perfectScrollbar();
        }

        // reset the scrollbar upon switching teams
        if (this.props.currentTeam !== prevProps.currentTeam) {
            this.refs.container.scrollTop = 0;
            $('.nav-pills__container').perfectScrollbar('update');
        }

        // close the LHS on mobile when you change channels
        if (this.props.currentChannel.id !== prevProps.currentChannel.id) {
            if (this.closedDirectChannel) {
                this.closedDirectChannel = false;
            } else {
                $('.app__body .inner-wrap').removeClass('move--right');
                $('.app__body .sidebar--left').removeClass('move--right');
                $('.multi-teams .team-sidebar').removeClass('move--right');
            }
        }

        this.updateTitle();

        if (this.props.currentChannel.type === Constants.DM_CHANNEL &&
            this.props.currentTeammate && prevProps.currentTeammate &&
            this.props.currentTeammate.display_name !== prevProps.currentTeammate.display_name
        ) {
            window.history.replaceState(null, null, `/${this.props.currentTeam.name}/messages/@${this.props.currentTeammate.display_name}`);
        }

        this.setBadgesActiveAndFavicon();
        this.setFirstAndLastUnreadChannels();
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.navigateChannelShortcut);
        document.removeEventListener('keydown', this.navigateUnreadChannelShortcut);
    }

    setBadgesActiveAndFavicon() {
        this.lastBadgesActive = this.badgesActive;
        this.badgesActive = this.props.unreads.mentions;

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
    }

    setFirstAndLastUnreadChannels() {
        const {
            currentChannel,
            unreadChannelIds,
        } = this.props;

        this.getDisplayedChannels().map((channelId) => {
            if (channelId !== currentChannel.id && unreadChannelIds.includes(channelId)) {
                if (!this.firstUnreadChannel) {
                    this.firstUnreadChannel = channelId;
                }
                this.lastUnreadChannel = channelId;
            }
            return null;
        });
    }

    handleOpenMoreDirectChannelsModal = (e) => {
        e.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
        }
    }

    updateTitle = () => {
        const {
            config,
            currentChannel,
            currentTeam,
            currentTeammate,
            unreads,
        } = this.props;

        if (currentChannel && currentTeam) {
            let currentSiteName = '';
            if (config.SiteName != null) {
                currentSiteName = config.SiteName;
            }

            let currentChannelName = currentChannel.display_name;
            if (currentChannel.type === Constants.DM_CHANNEL) {
                if (currentTeammate != null) {
                    currentChannelName = currentTeammate.display_name;
                }
            }

            const mentionTitle = unreads.mentionCount > 0 ? '(' + unreads.mentionCount + ') ' : '';
            const unreadTitle = unreads.messageCount > 0 ? '* ' : '';
            document.title = mentionTitle + unreadTitle + currentChannelName + ' - ' + this.props.currentTeam.display_name + ' ' + currentSiteName;
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

        let showTopUnread = false;
        let showBottomUnread = false;

        // Consider partially obscured channels as above/below
        const unreadMargin = 15;

        if (this.firstUnreadChannel) {
            const firstUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.firstUnreadChannel]));
            const fistUnreadPosition = firstUnreadElement ? firstUnreadElement.position() : null;

            if (fistUnreadPosition && fistUnreadPosition.top + firstUnreadElement.height() < unreadMargin) {
                showTopUnread = true;
            }
        }

        if (this.lastUnreadChannel) {
            const lastUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.lastUnreadChannel]));
            const lastUnreadPosition = lastUnreadElement ? lastUnreadElement.position() : null;

            if (lastUnreadPosition && lastUnreadPosition.top > container.height() - unreadMargin) {
                showBottomUnread = true;
            }
        }

        this.setState({
            showTopUnread,
            showBottomUnread,
        });
    }

    updateScrollbarOnChannelChange = (channelId) => {
        const curChannel = this.refs[channelId].getWrappedInstance().refs.channel.getBoundingClientRect();
        if ((curChannel.top - Constants.CHANNEL_SCROLL_ADJUSTMENT < 0) || (curChannel.top + curChannel.height > this.refs.container.getBoundingClientRect().height)) {
            this.refs.container.scrollTop = this.refs.container.scrollTop + (curChannel.top - Constants.CHANNEL_SCROLL_ADJUSTMENT);
            $('.nav-pills__container').perfectScrollbar('update');
        }
    }

    navigateChannelShortcut = (e) => {
        if (e.altKey && !e.shiftKey && (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            if (this.isSwitchingChannel) {
                return;
            }

            this.isSwitchingChannel = true;
            const allChannelIds = this.getDisplayedChannels();
            const curChannelId = this.props.currentChannel.id;
            let curIndex = -1;
            for (let i = 0; i < allChannelIds.length; i++) {
                if (allChannelIds[i] === curChannelId) {
                    curIndex = i;
                }
            }
            let nextIndex = curIndex;
            if (Utils.isKeyPressed(e, Constants.KeyCodes.DOWN)) {
                nextIndex = curIndex + 1;
            } else {
                nextIndex = curIndex - 1;
            }
            const nextChannel = allChannelIds[Utils.mod(nextIndex, allChannelIds.length)];
            this.props.actions.goToChannelById(nextChannel);
            this.updateScrollbarOnChannelChange(nextChannel);
            this.isSwitchingChannel = false;
        } else if (Utils.cmdOrCtrlPressed(e) && e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            this.handleOpenMoreDirectChannelsModal(e);
        }
    }

    navigateUnreadChannelShortcut = (e) => {
        if (e.altKey && e.shiftKey && (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            if (this.isSwitchingChannel) {
                return;
            }

            this.isSwitchingChannel = true;

            const allChannelIds = this.getDisplayedChannels();

            let direction = 0;
            if (Utils.isKeyPressed(e, Constants.KeyCodes.UP)) {
                direction = -1;
            } else {
                direction = 1;
            }

            const nextIndex = ChannelUtils.findNextUnreadChannelId(
                this.props.currentChannel.id,
                allChannelIds,
                this.props.unreadChannelIds,
                direction
            );

            if (nextIndex !== -1) {
                const nextChannel = allChannelIds[nextIndex];
                this.props.actions.goToChannelById(nextChannel);
                this.updateScrollbarOnChannelChange(nextChannel);
            }

            this.isSwitchingChannel = false;
        }
    }

    getDisplayedChannels = (props = this.props) => {
        if (props.showUnreadSection) {
            return props.unreadChannelIds.
                concat(props.favoriteChannelIds).
                concat(props.publicChannelIds).
                concat(props.privateChannelIds).
                concat(props.directAndGroupChannelIds);
        }

        return props.favoriteChannelIds.
            concat(props.publicChannelIds).
            concat(props.privateChannelIds).
            concat(props.directAndGroupChannelIds);
    };

    channelIdIsDisplayedForProps = (props, id) => {
        const allChannels = this.getDisplayedChannels(props);
        for (let i = 0; i < allChannels.length; i++) {
            if (allChannels[i] === id) {
                return true;
            }
        }
        return false;
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

    showMoreDirectChannelsModal = () => {
        trackEvent('ui', 'ui_channels_more_direct');
        this.setState({showDirectChannelsModal: true});
    }

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    }

    openQuickSwitcher = (e) => {
        e.preventDefault();
        AppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_QUICK_SWITCH_MODAL,
        });
    }

    createSidebarChannel = (channelId) => {
        return (
            <SidebarChannel
                key={channelId}
                ref={channelId}
                channelId={channelId}
                active={channelId === this.props.currentChannel.id}
                currentTeamName={this.props.currentTeam.name}
                currentUserId={this.props.currentUser.id}
            />
        );
    }

    render() {
        const {
            directAndGroupChannelIds,
            favoriteChannelIds,
            publicChannelIds,
            privateChannelIds,
            unreadChannelIds,
            showUnreadSection,
        } = this.props;

        // Check if we have all info needed to render
        if (this.props.currentTeam == null || this.props.currentUser == null) {
            return (<div/>);
        }

        this.badgesActive = false;

        // keep track of the first and last unread channels so we can use them to set the unread indicators
        this.firstUnreadChannel = null;
        this.lastUnreadChannel = null;

        // create elements for all 5 types of channels
        const unreadChannelItems = showUnreadSection ? unreadChannelIds.map(this.createSidebarChannel) : [];
        const favoriteItems = favoriteChannelIds.map(this.createSidebarChannel);
        const publicChannelItems = publicChannelIds.map(this.createSidebarChannel);
        const privateChannelItems = privateChannelIds.map(this.createSidebarChannel);
        const directMessageItems = directAndGroupChannelIds.map(this.createSidebarChannel);

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

        let tooltipTriggers = ['hover', 'focus'];

        if (Utils.isMobile()) {
            tooltipTriggers = [];
        }

        let createPublicChannelIcon = (
            <OverlayTrigger
                trigger={tooltipTriggers}
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
                trigger={tooltipTriggers}
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

        if (!this.props.showCreatePublicChannelOption) {
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

        if (!this.props.showCreatePrivateChannelOption) {
            createPrivateChannelIcon = null;
        }

        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.hideMoreDirectChannelsModal}
                    isExistingChannel={false}
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
                    teamDisplayName={this.props.currentTeam.display_name}
                    teamDescription={this.props.currentTeam.description}
                    teamName={this.props.currentTeam.name}
                    teamType={this.props.currentTeam.type}
                    currentUser={this.props.currentUser}
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
                    {unreadChannelItems.length !== 0 && <ul className='nav nav-pills nav-stacked'>
                        <li>
                            <h4 id='favoriteChannel'>
                                <FormattedMessage
                                    id='sidebar.unreadSection'
                                    defaultMessage='UNREADS'
                                />
                            </h4>
                        </li>
                        {unreadChannelItems}
                    </ul>}
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
