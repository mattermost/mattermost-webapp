// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import FileUploadOverlay from 'components/file_upload_overlay';
import RhsThread from 'components/rhs_thread';
import RhsCard from 'components/rhs_card';
import ChannelInfoRhs from 'components/channel_info_rhs';
import Search from 'components/search/index.tsx';

import RhsPlugin from 'plugins/rhs_plugin';

export default class SidebarRight extends React.PureComponent {
    static propTypes = {
        isExpanded: PropTypes.bool.isRequired,
        isOpen: PropTypes.bool.isRequired,
        channel: PropTypes.object,
        postRightVisible: PropTypes.bool,
        postCardVisible: PropTypes.bool,
        searchVisible: PropTypes.bool,
        isPinnedPosts: PropTypes.bool,
        isChannelFiles: PropTypes.bool,
        isChannelInfo: PropTypes.bool,
        isPluginView: PropTypes.bool,
        previousRhsState: PropTypes.string,
        rhsChannel: PropTypes.object,
        selectedPostId: PropTypes.string,
        selectedPostCardId: PropTypes.string,
        actions: PropTypes.shape({
            setRhsExpanded: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
            openRHSSearch: PropTypes.func.isRequired,
            closeRightHandSide: PropTypes.func.isRequired,
            openAtPrevious: PropTypes.func.isRequired,
            updateSearchTerms: PropTypes.func.isRequired,
            showChannelFiles: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
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
            selectedPostId: this.props.selectedPostId,
            selectedPostCardId: this.props.selectedPostCardId,
            previousRhsState: this.props.previousRhsState,
        };
    }

    handleShortcut = (e) => {
        if (Utils.cmdOrCtrlPressed(e)) {
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

    componentDidUpdate(prevProps) {
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

    onFinishTransition = (e) => {
        if (e.propertyName === 'transform') {
            this.setState({isOpened: this.props.isOpen});
        }
    }

    onShrink = () => {
        this.props.actions.setRhsExpanded(false);
    };

    handleUpdateSearchTerms = (term) => {
        this.props.actions.updateSearchTerms(term);
        this.focusSearchBar();
    }

    getSearchBarFocus = (focusSearchBar) => {
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
            isExpanded,
        } = this.props;

        let content = null;
        const isSidebarRightExpanded = (postRightVisible || postCardVisible || isPluginView || searchVisible) && isExpanded;

        switch (true) {
        case postRightVisible:
            content = (
                <div className='post-right__container'>
                    <FileUploadOverlay overlayType='right'/>
                    <RhsThread
                        previousRhsState={previousRhsState}
                        toggleSize={this.toggleSize}
                        shrink={this.onShrink}
                    />
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
                <ChannelInfoRhs channel={rhsChannel}/>
            );
            break;
        }

        return (
            <div
                className={classNames('sidebar--right', {
                    'sidebar--right--expanded': isSidebarRightExpanded,
                    'move--left': isOpen,
                    hidden: !isOpen,
                })}
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
                        channelDisplayName={rhsChannel ? rhsChannel.display_name : ''}
                    >
                        {isOpen && content}
                    </Search>
                </div>
            </div>
        );
    }
}
