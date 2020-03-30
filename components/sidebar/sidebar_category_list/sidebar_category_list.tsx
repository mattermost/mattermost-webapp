// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import Scrollbars from 'react-custom-scrollbars';
import {Spring, SpringSystem} from 'rebound';
import classNames from 'classnames';
import debounce from 'lodash/debounce';

import {Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {Team} from 'mattermost-redux/types/teams';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import UnreadChannelIndicator from 'components/unread_channel_indicator';
import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';
import * as ChannelUtils from 'utils/channel_utils.jsx';

import SidebarCategory from '../sidebar_category';

export function renderView(props: any) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal(props: any) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />);
}

export function renderThumbVertical(props: any) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

type Props = {
    currentTeam: Team;
    currentChannel: Channel;
    categories: ChannelCategory[];
    unreadChannelIds: string[];
    isUnreadFilterEnabled: boolean;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    displayedChannels: Channel[];
    actions: {
        switchToChannelById: (channelId: string) => void;
        close: () => void;
    };
};

type State = {
    showTopUnread: boolean;
    showBottomUnread: boolean;
};

// scrollMargin is the margin at the edge of the channel list that we leave when scrolling to a channel.
const scrollMargin = 10;

// categoryHeaderHeight is the height of the category header
const categoryHeaderHeight = 32;

// scrollMarginWithUnread is the margin that we leave at the edge of the channel list when scrolling to a channel so
// that the channel is not under the unread indicator.
const scrollMarginWithUnread = 55;

export default class SidebarCategoryList extends React.PureComponent<Props, State> {
    channelRefs: Map<string, HTMLLIElement>;
    scrollbar: React.RefObject<Scrollbars>;
    animate: SpringSystem;
    scrollAnimation: Spring;

    constructor(props: Props) {
        super(props);

        this.channelRefs = new Map();
        this.state = {
            showTopUnread: false,
            showBottomUnread: false,
        };
        this.scrollbar = React.createRef();

        this.animate = new SpringSystem();
        this.scrollAnimation = this.animate.createSpring();
        this.scrollAnimation.setOvershootClampingEnabled(true); // disables the spring action at the end of animation
        this.scrollAnimation.addListener({onSpringUpdate: this.handleScrollAnimationUpdate});
    }

    componentDidMount() {
        document.addEventListener('keydown', this.navigateChannelShortcut);
        document.addEventListener('keydown', this.navigateUnreadChannelShortcut);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.navigateChannelShortcut);
        document.removeEventListener('keydown', this.navigateUnreadChannelShortcut);
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.props.currentChannel || !prevProps.currentChannel) {
            return;
        }

        // reset the scrollbar upon switching teams
        if (this.props.currentTeam !== prevProps.currentTeam) {
            this.scrollbar.current!.scrollToTop();
        }

        // Scroll to selected channel so it's in view
        if (this.props.currentChannel.id !== prevProps.currentChannel.id) {
            // This will be re-enabled when we can avoid animating the scroll on first load and team switch
            // this.scrollToChannel(this.props.currentChannel.id);
        }

        // TODO: Copying over so it doesn't get lost, but we don't have a design for the sidebar on mobile yet
        // close the LHS on mobile when you change channels
        if (this.props.currentChannel.id !== prevProps.currentChannel.id) {
            this.props.actions.close();
        }

        this.updateUnreadIndicators();
    }

    getDisplayedChannelIds = () => {
        return this.props.displayedChannels.map((channel) => channel.id);
    }

    getChannelRef = (channelId: string) => {
        return this.channelRefs.get(channelId);
    }

    setChannelRef = (channelId: string, ref: HTMLLIElement) => {
        if (ref) {
            this.channelRefs.set(channelId, ref);
        } else {
            this.channelRefs.delete(channelId);
        }
    }

    getFirstUnreadChannelFromChannelIdArray = (channelIds: string[]) => {
        if (!this.props.currentChannel) {
            return null;
        }

        return channelIds.find((channelId) => {
            return channelId !== this.props.currentChannel!.id && this.props.unreadChannelIds.includes(channelId);
        });
    }

    handleScrollAnimationUpdate = (spring: Spring) => {
        const val = spring.getCurrentValue();
        this.scrollbar.current!.scrollTop(val);
    }

    scrollToFirstUnreadChannel = () => {
        this.scrollToChannel(this.getFirstUnreadChannel(), true);
    }

    scrollToLastUnreadChannel = () => {
        this.scrollToChannel(this.getLastUnreadChannel(), true);
    }

    scrollToChannel = (channelId: string | null | undefined, scrollingToUnread = false) => {
        if (!channelId) {
            return;
        }

        const element = this.channelRefs.get(channelId);
        if (!element) {
            return;
        }

        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;

        const scrollTop = this.scrollbar.current!.getScrollTop();
        const scrollHeight = this.scrollbar.current!.getClientHeight();

        if (top < (scrollTop + categoryHeaderHeight)) {
            // Scroll up to the item
            const margin = (scrollingToUnread || !this.state.showTopUnread) ? scrollMargin : scrollMarginWithUnread;

            let scrollEnd;
            const displayedChannels = this.getDisplayedChannelIds();
            if (displayedChannels.length > 0 && displayedChannels[0] === channelId) {
                // This is the first channel, so scroll right to the top
                scrollEnd = 0;
            } else {
                scrollEnd = top - margin - categoryHeaderHeight;
            }

            this.scrollToPosition(scrollEnd);
        } else if (bottom > scrollTop + scrollHeight) {
            // Scroll down to the item
            const margin = (scrollingToUnread || !this.state.showBottomUnread) ? scrollMargin : scrollMarginWithUnread;
            const scrollEnd = (bottom - scrollHeight) + margin;

            this.scrollToPosition(scrollEnd);
        }
    }

    scrollToPosition = (scrollEnd: number) => {
        // Stop the current animation before scrolling
        this.scrollAnimation.setCurrentValue(this.scrollbar.current!.getScrollTop()).setAtRest();

        this.scrollAnimation.setEndValue(scrollEnd);
    }

    updateUnreadIndicators = () => {
        let showTopUnread = false;
        let showBottomUnread = false;

        // Consider partially obscured channels as above/below
        const firstUnreadChannel = this.getFirstUnreadChannel();
        const lastUnreadChannel = this.getLastUnreadChannel();

        if (firstUnreadChannel) {
            const firstUnreadElement = this.channelRefs.get(firstUnreadChannel);
            const firstUnreadPosition = firstUnreadElement ? firstUnreadElement.offsetTop : null;

            if (firstUnreadPosition && ((firstUnreadPosition + firstUnreadElement!.offsetHeight) - scrollMargin - categoryHeaderHeight) < this.scrollbar.current!.getScrollTop()) {
                showTopUnread = true;
            }
        }

        if (lastUnreadChannel) {
            const lastUnreadElement = this.channelRefs.get(lastUnreadChannel);
            const lastUnreadPosition = lastUnreadElement ? lastUnreadElement.offsetTop : null;

            if (lastUnreadPosition && (lastUnreadPosition + scrollMargin) > (this.scrollbar.current!.getScrollTop() + this.scrollbar.current!.getClientHeight())) {
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

    getFirstUnreadChannel = () => {
        return this.getFirstUnreadChannelFromChannelIdArray(this.getDisplayedChannelIds());
    }

    getLastUnreadChannel = () => {
        return this.getFirstUnreadChannelFromChannelIdArray(this.getDisplayedChannelIds().reverse());
    }

    navigateChannelShortcut = (e: KeyboardEvent) => {
        if (e.altKey && !e.shiftKey && (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            const allChannelIds = this.getDisplayedChannelIds();
            const curChannelId = this.props.currentChannel!.id;
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
        } else if (Utils.cmdOrCtrlPressed(e) && e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            this.props.handleOpenMoreDirectChannelsModal(e);
        }
    };

    navigateUnreadChannelShortcut = (e: KeyboardEvent) => {
        if (e.altKey && e.shiftKey && (Utils.isKeyPressed(e, Constants.KeyCodes.UP) || Utils.isKeyPressed(e, Constants.KeyCodes.DOWN))) {
            e.preventDefault();

            const allChannelIds = this.getDisplayedChannelIds();

            let direction = 0;
            if (Utils.isKeyPressed(e, Constants.KeyCodes.UP)) {
                direction = -1;
            } else {
                direction = 1;
            }

            const nextIndex = ChannelUtils.findNextUnreadChannelId(
                this.props.currentChannel!.id,
                allChannelIds,
                this.props.unreadChannelIds,
                direction
            );

            if (nextIndex !== -1) {
                const nextChannelId = allChannelIds[nextIndex];
                this.props.actions.switchToChannelById(nextChannelId);
                this.scrollToChannel(nextChannelId);
            }
        }
    };

    renderCategory = (category: ChannelCategory) => {
        return (
            <SidebarCategory
                key={category.id}
                category={category}
                setChannelRef={this.setChannelRef}
                handleOpenMoreDirectChannelsModal={this.props.handleOpenMoreDirectChannelsModal}
                getChannelRef={this.getChannelRef}
            />
        );
    }

    onScroll = () => {
        this.updateUnreadIndicators();
    }

    onTransitionEnd = debounce(() => {
        this.updateUnreadIndicators();
    }, 100);

    render() {
        const {categories} = this.props;
        const renderedCategories = categories.map(this.renderCategory);

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

        return (

            // NOTE: id attribute added to temporarily support the desktop app's at-mention DOM scraping of the old sidebar
            <div
                id='sidebar-left'
                className={classNames('SidebarNavContainer a11y__region', {disabled: this.props.isUnreadFilterEnabled})}
                data-a11y-sort-order='7'
                onTransitionEnd={this.onTransitionEnd}
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
                <Scrollbars
                    ref={this.scrollbar}
                    autoHide={true}
                    autoHideTimeout={500}
                    autoHideDuration={500}
                    renderThumbHorizontal={renderThumbHorizontal}
                    renderThumbVertical={renderThumbVertical}
                    renderView={renderView}
                    onScroll={this.onScroll}
                    style={{position: 'absolute'}}
                >
                    {renderedCategories}
                </Scrollbars>
            </div>
        );
    }
}
