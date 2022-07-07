// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils';

import FileUploadOverlay from 'components/file_upload_overlay';
import RhsThread from 'components/rhs_thread';
import RhsCard from 'components/rhs_card';
import ChannelInfoRhs from 'components/channel_info_rhs';
import ChannelMembersRhs from 'components/channel_members_rhs';
import Search from 'components/search/index';

import RhsPlugin from 'plugins/rhs_plugin';
import {Channel} from '@mattermost/types/channels';

type Props = {
    isExpanded: boolean;
    isOpen: boolean;
    channel: Channel;
    postRightVisible: boolean;
    postCardVisible: boolean;
    searchVisible: boolean;
    isPinnedPosts: boolean;
    isChannelFiles: boolean;
    isChannelInfo: boolean;
    isChannelMembers: boolean;
    isPluginView: boolean;
    previousRhsState: string;
    rhsChannel: Channel;
    selectedPostId: string;
    selectedPostCardId: string;
    actions: {
        setRhsExpanded: (expanded: boolean) => void;
        showPinnedPosts: (channelId: string) => void;
        openRHSSearch: () => void;
        closeRightHandSide: () => void;
        openAtPrevious: (previos: Partial<Props> | undefined) => void;
        updateSearchTerms: (terms: string) => void;
        showChannelFiles: (channelId: string) => void;
        showChannelInfo: (channelId: string) => void;
    };
}

type State = {
    isOpened: boolean;
}

export default class SidebarRight extends React.PureComponent<Props, State> {
    sidebarRight: React.RefObject<HTMLDivElement>;
    previous: Partial<Props> | undefined = undefined;
    focusSearchBar?: () => void;

    constructor(props: Props) {
        super(props);

        this.sidebarRight = React.createRef();
        this.state = {
            isOpened: false,
        };
    }

    setPrevious = () => {
        if (!this.props.isOpen) {
            return;
        }

        this.previous = {
            searchVisible: this.props.searchVisible,
            isPinnedPosts: this.props.isPinnedPosts,
            isChannelFiles: this.props.isChannelFiles,
            isChannelInfo: this.props.isChannelInfo,
            isChannelMembers: this.props.isChannelMembers,
            selectedPostId: this.props.selectedPostId,
            selectedPostCardId: this.props.selectedPostCardId,
            previousRhsState: this.props.previousRhsState,
        };
    }

    handleShortcut = (e: KeyboardEvent) => {
        const channelInfoShortcutMac = Utils.isMac() && e.shiftKey;
        const channelInfoShortcut = !Utils.isMac() && e.altKey;

        if (Utils.cmdOrCtrlPressed(e, true)) {
            if (e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.PERIOD)) {
                e.preventDefault();
                if (this.props.isOpen) {
                    if (this.props.isExpanded) {
                        this.props.actions.setRhsExpanded(false);
                    } else {
                        this.props.actions.setRhsExpanded(true);
                    }
                } else {
                    this.props.actions.openAtPrevious(this.previous);
                }
            } else if (Utils.isKeyPressed(e, Constants.KeyCodes.PERIOD)) {
                e.preventDefault();
                if (this.props.isOpen) {
                    this.props.actions.closeRightHandSide();
                } else {
                    this.props.actions.openAtPrevious(this.previous);
                }
            } else if (Utils.isKeyPressed(e, Constants.KeyCodes.I) && (channelInfoShortcutMac || channelInfoShortcut)) {
                e.preventDefault();
                if (this.props.isOpen && this.props.isChannelInfo) {
                    this.props.actions.closeRightHandSide();
                } else {
                    this.props.actions.showChannelInfo(this.props.channel.id);
                }
            }
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.determineTransition);
        document.addEventListener('keydown', this.handleShortcut);
        this.determineTransition();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.determineTransition);
        document.removeEventListener('keydown', this.handleShortcut);
        if (this.sidebarRight.current) {
            this.sidebarRight.current.removeEventListener('transitionend', this.onFinishTransition);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const wasOpen = prevProps.searchVisible || prevProps.postRightVisible;
        const isOpen = this.props.searchVisible || this.props.postRightVisible;

        if (!wasOpen && isOpen) {
            this.determineTransition();
            trackEvent('ui', 'ui_rhs_opened');
        }

        const {actions, isChannelFiles, isPinnedPosts, rhsChannel, channel} = this.props;
        if (isPinnedPosts && prevProps.isPinnedPosts === isPinnedPosts && rhsChannel.id !== prevProps.rhsChannel.id) {
            actions.showPinnedPosts(rhsChannel.id);
        }

        if (isChannelFiles && prevProps.isChannelFiles === isChannelFiles && rhsChannel.id !== prevProps.rhsChannel.id) {
            actions.showChannelFiles(rhsChannel.id);
        }

        // in the case of navigating to another channel
        // or from global threads to a channel
        // we shrink the sidebar
        if (
            (channel && prevProps.channel && (channel.id !== prevProps.channel.id)) ||
            (channel && !prevProps.channel)
        ) {
            this.props.actions.setRhsExpanded(false);
        }

        this.setPrevious();
    }

    determineTransition = () => {
        let transitionInfo;
        if (this.sidebarRight.current) {
            transitionInfo = window.getComputedStyle(this.sidebarRight.current).getPropertyValue('transition');
        }
        const hasTransition = Boolean(transitionInfo) && transitionInfo !== 'all 0s ease 0s';

        if (this.sidebarRight.current && hasTransition) {
            this.setState({isOpened: this.props.isOpen});
            this.sidebarRight.current.addEventListener('transitionend', this.onFinishTransition);
        } else {
            this.setState({isOpened: true});
            if (this.sidebarRight.current) {
                this.sidebarRight.current.removeEventListener('transitionend', this.onFinishTransition);
            }
        }
    }

    onFinishTransition = (e: TransitionEvent) => {
        if (e.propertyName === 'transform') {
            this.setState({isOpened: this.props.isOpen});
        }
    }

    onShrink = () => {
        this.props.actions.setRhsExpanded(false);
    };

    handleUpdateSearchTerms = (term: string) => {
        this.props.actions.updateSearchTerms(term);
        if (this.focusSearchBar) {
            this.focusSearchBar();
        }
    }

    getSearchBarFocus = (focusSearchBar: () => void) => {
        this.focusSearchBar = focusSearchBar;
    }

    render() {
        const {
            rhsChannel,
            postRightVisible,
            postCardVisible,
            previousRhsState,
            searchVisible,
            isPluginView,
            isOpen,
            isChannelInfo,
            isChannelMembers,
            isExpanded,
        } = this.props;

        let content = null;
        const isSidebarRightExpanded = (postRightVisible || postCardVisible || isPluginView || searchVisible) && isExpanded;

        switch (true) {
        case postRightVisible:
            content = (
                <div className='post-right__container'>
                    <FileUploadOverlay overlayType='right'/>
                    <RhsThread previousRhsState={previousRhsState}/>
                </div>
            );
            break;
        case postCardVisible:
            content = <RhsCard previousRhsState={previousRhsState}/>;
            break;
        case isPluginView:
            content = <RhsPlugin/>;
            break;
        case isChannelInfo:
            content = (
                <ChannelInfoRhs/>
            );
            break;
        case isChannelMembers:
            content = (
                <ChannelMembersRhs/>
            );
            break;
        }
        const channelDisplayName = rhsChannel ? rhsChannel.display_name : '';
        const containerClassName = classNames('sidebar--right', {
            'sidebar--right--expanded': isSidebarRightExpanded,
            'move--left': isOpen,
            hidden: !isOpen,
        });

        return (
            <div
                className={containerClassName}
                id='sidebar-right'
                role='complementary'
                ref={this.sidebarRight}
            >
                <div
                    onClick={this.onShrink}
                    className='sidebar--right__bg'
                />
                <div className='sidebar-right-container'>
                    <Search
                        isSideBarRight={true}
                        isSideBarRightOpen={this.state.isOpened}
                        getFocus={this.getSearchBarFocus}
                        channelDisplayName={channelDisplayName}
                    >
                        {isOpen && content}
                    </Search>
                </div>
            </div>
        );
    }
}
