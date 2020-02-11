// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage, injectIntl} from 'react-intl';
import {PropTypes} from 'prop-types';
import classNames from 'classnames';

import Scrollbars from 'react-custom-scrollbars';
import {SpringSystem, MathUtil} from 'rebound';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {redirectUserToDefaultTeam} from 'actions/global_actions';
import * as ChannelUtils from 'utils/channel_utils.jsx';
import {Constants, ModalIdentifiers, SidebarChannelGroups} from 'utils/constants';
import {intlShape} from 'utils/react_intl';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import favicon16x16 from 'images/favicon/favicon-16x16.png';
import favicon32x32 from 'images/favicon/favicon-32x32.png';
import favicon96x96 from 'images/favicon/favicon-96x96.png';
import redDotFavicon16x16 from 'images/favicon/favicon-reddot-16x16.png';
import redDotFavicon32x32 from 'images/favicon/favicon-reddot-32x32.png';
import redDotFavicon96x96 from 'images/favicon/favicon-reddot-96x96.png';
import MoreChannels from 'components/more_channels';
import MoreDirectChannels from 'components/more_direct_channels';
import QuickSwitchModal from 'components/quick_switch_modal';
import NewChannelFlow from 'components/new_channel_flow';
import UnreadChannelIndicator from 'components/unread_channel_indicator';
import Pluggable from 'plugins/pluggable';

import SidebarHeader from './header';
import SidebarChannel from './sidebar_channel';
import ChannelCreate from './channel_create';
import ChannelMore from './channel_more';
import ChannelName from './channel_name';
import MorePublicDirectChannels from './more_public_direct_channels';

export function renderView(props) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal(props) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />);
}

export function renderThumbVertical(props) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

// scrollMargin is the margin at the edge of the channel list that we leave when scrolling to a channel.
const scrollMargin = 15;

// scrollMarginWithUnread is the margin that we leave at the edge of the channel list when scrolling to a channel so
// that the channel is not under the unread indicator.
const scrollMarginWithUnread = 60;

class Sidebar extends React.PureComponent {
    static propTypes = {

        /**
         * Global config object
         */
        config: PropTypes.object.isRequired,

        isOpen: PropTypes.bool.isRequired,

        /**
         * List of unread channels (ids)
         */
        unreadChannelIds: PropTypes.array,

        /**
         * List of ordered channels (ids)
         */
        orderedChannelIds: PropTypes.arrayOf(PropTypes.shape({

            /**
             * Type of channel
             */
            type: PropTypes.string.isRequired,

            /**
             * Displayed name in sidebar
             */
            name: PropTypes.string.isRequired,

            /**
             * List of ids for the channels (ids)
             */
            items: PropTypes.array.isRequired,
        })),

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
        currentTeam: PropTypes.object,

        /**
         * Current user object
         */
        currentUser: PropTypes.object,

        intl: intlShape.isRequired,

        /**
         * Number of unread mentions/messages
         */
        unreads: PropTypes.object.isRequired,

        /**
         * Permission to create public channel
         */
        canCreatePublicChannel: PropTypes.bool.isRequired,

        /**
         * Permission to create private channel
         */
        canCreatePrivateChannel: PropTypes.bool.isRequired,

        /**
         * Flag to display the Switch channel shortcut
         */
        channelSwitcherOption: PropTypes.bool.isRequired,

        /**
         * Setting that enables user to view archived channels
         */
        viewArchivedChannels: PropTypes.bool,

        actions: PropTypes.shape({
            close: PropTypes.func.isRequired,
            switchToChannelById: PropTypes.func.isRequired,
            openModal: PropTypes.func.isRequired,
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
            orderedChannelIds: props.orderedChannelIds,
            showDirectChannelsModal: false,
            showMoreChannelsModal: false,
            showMorePublicChannelsModal: false,
            morePublicChannelsModalType: 'public',
        };

        this.animate = new SpringSystem();
        this.scrollAnimation = this.animate.createSpring();
        this.scrollAnimation.setOvershootClampingEnabled(true); // disables the spring action at the end of animation
        this.scrollAnimation.addListener({onSpringUpdate: this.handleScrollAnimationUpdate});
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.orderedChannelIds[0].type === SidebarChannelGroups.UNREADS &&
            prevState.orderedChannelIds[0].type === SidebarChannelGroups.UNREADS &&
            prevState.orderedChannelIds[0].items.length === nextProps.orderedChannelIds[0].items.length &&
            prevState.orderedChannelIds[0].items.includes(nextProps.currentChannel.id)
        ) {
            return null;
        }

        if (nextProps.orderedChannelIds !== prevState.orderedChannelIds) {
            return {orderedChannelIds: nextProps.orderedChannelIds};
        }

        return null;
    }

    componentDidMount() {
        this.updateUnreadIndicators();
        document.addEventListener('keydown', this.navigateChannelShortcut);
        document.addEventListener('keydown', this.navigateUnreadChannelShortcut);
    }

    componentDidUpdate(prevProps) {
        // if the active channel disappeared (which can happen when dm channels
        // autoclose), go to user default channel in team
        if (this.props.currentTeam === prevProps.currentTeam &&
            this.props.currentChannel.id === prevProps.currentChannel.id &&
            !this.channelIdIsDisplayedForProps(this.props.orderedChannelIds, this.props.currentChannel.id) &&
            this.channelIdIsDisplayedForProps(prevProps.orderedChannelIds, this.props.currentChannel.id)
        ) {
            this.closedDirectChannel = true;
            redirectUserToDefaultTeam();
            return;
        }

        // reset the scrollbar upon switching teams
        if (this.props.currentTeam !== prevProps.currentTeam) {
            this.refs.scrollbar.scrollToTop();
        }

        // Scroll to selected channel so it's in view
        if (this.props.currentChannel.id !== prevProps.currentChannel.id) {
            // This will be re-enabled after 5.20 when the weird scrolling behaviour when switching teams can be resolved
            // this.scrollToChannel(this.props.currentChannel.id);
        }

        // close the LHS on mobile when you change channels
        if (this.props.currentChannel.id !== prevProps.currentChannel.id) {
            if (this.closedDirectChannel) {
                this.closedDirectChannel = false;
            } else {
                this.props.actions.close();
            }
        }

        this.updateTitle();

        this.setBadgesActiveAndFavicon();

        this.setFirstAndLastUnreadChannels();
        this.updateUnreadIndicators();
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.navigateChannelShortcut);
        document.removeEventListener('keydown', this.navigateUnreadChannelShortcut);

        this.animate.deregisterSpring(this.scrollAnimation);
        this.animate.removeAllListeners();
        this.scrollAnimation.destroy();
    }

    setBadgesActiveAndFavicon() {
        if (!(UserAgent.isFirefox() || UserAgent.isChrome())) {
            return;
        }

        const link = document.querySelector('link[rel="icon"]');

        if (!link) {
            return;
        }

        this.lastBadgesActive = this.badgesActive;
        this.badgesActive = this.props.unreads.mentionCount > 0;

        // update the favicon to show if there are any notifications
        if (this.lastBadgesActive !== this.badgesActive) {
            this.updateFavicon(this.badgesActive);
        }
    }

    updateFavicon = (active) => {
        const link16x16 = document.querySelector('link[rel="icon"][sizes="16x16"]');
        const link32x32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
        const link96x96 = document.querySelector('link[rel="icon"][sizes="96x96"]');

        if (active) {
            link16x16.href = typeof redDotFavicon16x16 === 'string' ? redDotFavicon16x16 : '';
            link32x32.href = typeof redDotFavicon32x32 === 'string' ? redDotFavicon32x32 : '';
            link96x96.href = typeof redDotFavicon96x96 === 'string' ? redDotFavicon96x96 : '';
        } else {
            link16x16.href = typeof favicon16x16 === 'string' ? favicon16x16 : '';
            link32x32.href = typeof favicon32x32 === 'string' ? favicon32x32 : '';
            link96x96.href = typeof favicon96x96 === 'string' ? favicon96x96 : '';
        }
    }

    setFirstAndLastUnreadChannels() {
        const {currentChannel, unreadChannelIds} = this.props;
        const {orderedChannelIds} = this.state;

        this.getDisplayedChannels(orderedChannelIds).map((channelId) => {
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
        const {formatMessage} = this.props.intl;

        const currentSiteName = config.SiteName || '';

        if (currentChannel && currentTeam && currentChannel.id) {
            let currentChannelName = currentChannel.display_name;
            if (currentChannel.type === Constants.DM_CHANNEL) {
                if (currentTeammate != null) {
                    currentChannelName = currentTeammate.display_name;
                }
            }

            const mentionTitle = unreads.mentionCount > 0 ? '(' + unreads.mentionCount + ') ' : '';
            const unreadTitle = unreads.messageCount > 0 ? '* ' : '';
            document.title = mentionTitle + unreadTitle + currentChannelName + ' - ' + this.props.currentTeam.display_name + ' ' + currentSiteName;
        } else {
            document.title = formatMessage({id: 'sidebar.team_select', defaultMessage: '{siteName} - Join a team'}, {siteName: currentSiteName || 'Mattermost'});
        }
    }

    onScroll = () => {
        this.updateUnreadIndicators();
    }

    handleScrollAnimationUpdate = (spring) => {
        const {scrollbar} = this.refs;
        const val = spring.getCurrentValue();
        scrollbar.scrollTop(val);
    }

    scrollToFirstUnreadChannel = () => {
        this.scrollToChannel(this.firstUnreadChannel, true);
    }

    scrollToLastUnreadChannel = () => {
        this.scrollToChannel(this.lastUnreadChannel, true);
    }

    scrollToChannel = (channelId, scrollingToUnread = false) => {
        const element = $(ReactDOM.findDOMNode(this.refs[channelId]));
        if (!element) {
            return;
        }

        const position = element.position();
        if (!position) {
            return;
        }

        const top = position.top;
        const bottom = top + element.height();

        const scrollTop = this.refs.scrollbar.getScrollTop();
        const scrollHeight = this.refs.scrollbar.getClientHeight();

        if (top < scrollTop) {
            // Scroll up to the item
            const margin = (scrollingToUnread || !this.state.showTopUnread) ? scrollMargin : scrollMarginWithUnread;

            let scrollEnd;
            const displayedChannels = this.getDisplayedChannels(this.state.orderedChannelIds);
            if (displayedChannels.length > 0 && displayedChannels[0] === channelId) {
                // This is the first channel, so scroll right to the top
                scrollEnd = MathUtil.mapValueInRange(0, 0, 1, 0, 1);
            } else {
                scrollEnd = MathUtil.mapValueInRange(top - margin, 0, 1, 0, 1);
            }

            this.scrollToPosition(scrollEnd);
        } else if (bottom > scrollTop + scrollHeight) {
            // Scroll down to the item
            const margin = (scrollingToUnread || !this.state.showBottomUnread) ? scrollMargin : scrollMarginWithUnread;
            const scrollEnd = (bottom - scrollHeight) + margin;

            this.scrollToPosition(scrollEnd);
        }
    }

    scrollToPosition = (scrollEnd) => {
        // Stop the current animation before scrolling
        this.scrollAnimation.setCurrentValue(this.refs.scrollbar.getScrollTop()).setAtRest();

        this.scrollAnimation.setEndValue(scrollEnd);
    }

    updateUnreadIndicators = () => {
        let showTopUnread = false;
        let showBottomUnread = false;

        // Consider partially obscured channels as above/below

        if (this.firstUnreadChannel) {
            const firstUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.firstUnreadChannel]));
            const firstUnreadPosition = firstUnreadElement ? firstUnreadElement.position() : null;

            if (firstUnreadPosition && ((firstUnreadPosition.top + firstUnreadElement.height()) - scrollMargin) < this.refs.scrollbar.getScrollTop()) {
                showTopUnread = true;
            }
        }

        if (this.lastUnreadChannel) {
            const lastUnreadElement = $(ReactDOM.findDOMNode(this.refs[this.lastUnreadChannel]));
            const lastUnreadPosition = lastUnreadElement ? lastUnreadElement.position() : null;

            if (lastUnreadPosition && (lastUnreadPosition.top + scrollMargin) > (this.refs.scrollbar.getScrollTop() + this.refs.scrollbar.getClientHeight())) {
                showBottomUnread = true;
            }
        }
        if (showTopUnread !== this.state.showTopUnread || showBottomUnread !== this.state.showBottomUnread) {
            this.setState({
                showTopUnread,
                showBottomUnread,
            });
        }
    }

    navigateChannelShortcut = (e) => {
        if (e.altKey && !e.shiftKey && (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            if (this.isSwitchingChannel) {
                return;
            }

            this.isSwitchingChannel = true;
            const allChannelIds = this.getDisplayedChannels(this.state.orderedChannelIds);
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
            const nextChannelId = allChannelIds[Utils.mod(nextIndex, allChannelIds.length)];
            this.props.actions.switchToChannelById(nextChannelId);
            this.scrollToChannel(nextChannelId);

            this.isSwitchingChannel = false;
        } else if (Utils.cmdOrCtrlPressed(e) && e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            this.handleOpenMoreDirectChannelsModal(e);
        }
    };

    navigateUnreadChannelShortcut = (e) => {
        if (e.altKey && e.shiftKey && (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            if (this.isSwitchingChannel) {
                return;
            }

            this.isSwitchingChannel = true;

            const allChannelIds = this.getDisplayedChannels(this.state.orderedChannelIds);

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
                const nextChannelId = allChannelIds[nextIndex];
                this.props.actions.switchToChannelById(nextChannelId);
                this.scrollToChannel(nextChannelId);
            }

            this.isSwitchingChannel = false;
        }
    };

    getDisplayedChannels = (orderedChannelIds = []) => {
        return orderedChannelIds.reduce((allChannelIds, section) => {
            allChannelIds.push(...section.items);
            return allChannelIds;
        }, []);
    };

    channelIdIsDisplayedForProps = (orderedChannelIds = [], id) => {
        const allChannels = this.getDisplayedChannels(orderedChannelIds);
        for (let i = 0; i < allChannels.length; i++) {
            if (allChannels[i] === id) {
                return true;
            }
        }
        return false;
    }

    showMorePublicDirectChannelsModal = () => {
        this.setState({showMorePublicChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_public_direct');
    }

    hideMorePublicDirectChannelsModal = () => {
        this.setState({showMorePublicChannelsModal: false});
    }

    onHandleNewChannel = () => {
        this.hideMorePublicDirectChannelsModal();
        this.showNewChannelModal(Constants.OPEN_CHANNEL);
    }

    showMoreChannelsModal = (type) => {
        this.setState({showMoreChannelsModal: true, morePublicChannelsModalType: type});
        trackEvent('ui', 'ui_channels_more_public');
    }

    hideMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: false});
    }

    showNewPublicChannelModal = () => {
        this.showNewChannelModal(Constants.OPEN_CHANNEL);
    }

    showNewPrivateChannelModal = () => {
        this.showNewChannelModal(Constants.PRIVATE_CHANNEL);
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
        this.props.actions.openModal({
            modalId: ModalIdentifiers.QUICK_SWITCH,
            dialogType: QuickSwitchModal,
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

    renderOrderedChannels = () => {
        const {orderedChannelIds} = this.state;

        const sectionsToHide = [SidebarChannelGroups.UNREADS, SidebarChannelGroups.FAVORITE];

        return (
            <Scrollbars
                ref='scrollbar'
                autoHide={true}
                autoHideTimeout={500}
                autoHideDuration={500}
                renderThumbHorizontal={renderThumbHorizontal}
                renderThumbVertical={renderThumbVertical}
                renderView={renderView}
                onScroll={this.onScroll}
                style={{position: 'absolute'}}
            >
                <div
                    id='sidebarChannelContainer'
                    className='nav-pills__container'
                >
                    {orderedChannelIds.map((sec) => {
                        const section = {
                            type: sec.type,
                            name: sec.name,
                            items: sec.items.map(this.createSidebarChannel),
                        };

                        if (sectionsToHide.indexOf(section.type) !== -1 && section.items.length === 0) {
                            return null;
                        }

                        const sectionId = `${section.type}Channel`;
                        const ariaLabel = section.name.toLowerCase();

                        return (
                            <ul
                                key={section.type}
                                aria-label={ariaLabel}
                                className='nav nav-pills nav-stacked a11y__section'
                                id={sectionId + 'List'}
                                tabIndex='-1'
                            >
                                <li className='sidebar-section__header'>
                                    <h4
                                        role='presentation'
                                        id={sectionId}
                                    >
                                        <ChannelName
                                            sectionType={section.type}
                                            channelName={section.name}
                                            browsePublicDirectChannels={this.showMorePublicDirectChannelsModal}
                                        />
                                    </h4>
                                    <ChannelCreate
                                        sectionType={section.type}
                                        canCreatePublicChannel={this.props.canCreatePublicChannel}
                                        canCreatePrivateChannel={this.props.canCreatePrivateChannel}
                                        createPublicChannel={this.showNewPublicChannelModal}
                                        createPrivateChannel={this.showNewPrivateChannelModal}
                                        createDirectMessage={this.handleOpenMoreDirectChannelsModal}
                                        createPublicDirectChannel={this.showNewPublicChannelModal}
                                    />
                                </li>
                                {section.items}
                                <ChannelMore
                                    currentTeamId={this.props.currentTeam.id}
                                    sectionType={section.type}
                                    moreChannels={this.showMoreChannelsModal}
                                    moreDirectMessages={this.handleOpenMoreDirectChannelsModal}
                                    browsePublicDirectChannels={this.showMorePublicDirectChannelsModal}
                                    viewArchivedChannels={this.props.viewArchivedChannels}
                                />
                            </ul>
                        );
                    })}
                </div>
            </Scrollbars>
        );
    };

    render() {
        const {channelSwitcherOption} = this.props;
        const ariaLabel = Utils.localizeMessage('accessibility.sections.lhsList', 'channel sidebar region');

        // Check if we have all info needed to render
        if (this.props.currentTeam == null || this.props.currentUser == null) {
            return (<div/>);
        }

        // keep track of the first and last unread channels so we can use them to set the unread indicators
        this.firstUnreadChannel = null;
        this.lastUnreadChannel = null;

        let showChannelModal = false;
        if (this.state.newChannelModalType !== '') {
            showChannelModal = true;
        }

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
                    morePublicChannelsModalType={this.state.morePublicChannelsModalType}
                />
            );
        }

        let quickSwitchText = null;
        if (channelSwitcherOption) {
            let quickSwitchTextShortcutId = t('quick_switch_modal.channelsShortcut.windows');
            let quickSwitchTextShortcutDefault = '- CTRL+K';
            if (Utils.isMac()) {
                quickSwitchTextShortcutId = t('quick_switch_modal.channelsShortcut.mac');
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

            quickSwitchText = (
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
            );
        }

        let morePublicDirectChannelsModal;
        if (this.state.showMorePublicChannelsModal) {
            morePublicDirectChannelsModal = (
                <MorePublicDirectChannels
                    onModalDismissed={this.hideMorePublicDirectChannelsModal}
                    handleNewChannel={this.onHandleNewChannel}
                    isExistingChannel={false}
                />
            );
        }

        return (
            <div
                className={classNames('sidebar--left', {'move--right': this.props.isOpen && Utils.isMobile()})}
                id='sidebar-left'
                key='sidebar-left'
            >
                <NewChannelFlow
                    show={showChannelModal}
                    canCreatePublicChannel={this.props.canCreatePublicChannel}
                    canCreatePrivateChannel={this.props.canCreatePrivateChannel}
                    channelType={this.state.newChannelModalType}
                    onModalDismissed={this.hideNewChannelModal}
                />
                {morePublicDirectChannelsModal}
                {moreDirectChannelsModal}
                {moreChannelsModal}

                <SidebarHeader/>

                <div className='sidebar--left__icons'>
                    <Pluggable pluggableName='LeftSidebarHeader'/>
                </div>

                <div
                    id='lhsList'
                    role='application'
                    aria-label={ariaLabel}
                    tabIndex='-1'
                    className='sidebar--left__list a11y__region'
                    data-a11y-sort-order='6'
                >
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

                    {this.renderOrderedChannels()}
                </div>
                {quickSwitchText}
            </div>
        );
    }
}

export default injectIntl(Sidebar);
