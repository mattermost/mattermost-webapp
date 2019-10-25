// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import FileUploadOverlay from 'components/file_upload_overlay.jsx';
import RhsThread from 'components/rhs_thread';
import RhsCard from 'components/rhs_card';
import SearchBar from 'components/search_bar';
import SearchResults from 'components/search_results';

import RhsPlugin from 'plugins/rhs_plugin';

export default class SidebarRight extends React.PureComponent {
    static propTypes = {
        isExpanded: PropTypes.bool.isRequired,
        isOpen: PropTypes.bool.isRequired,
        currentUserId: PropTypes.string.isRequired,
        channel: PropTypes.object,
        postRightVisible: PropTypes.bool,
        postCardVisible: PropTypes.bool,
        searchVisible: PropTypes.bool,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        isPinnedPosts: PropTypes.bool,
        isPluginView: PropTypes.bool,
        previousRhsState: PropTypes.string,
        actions: PropTypes.shape({
            setRhsExpanded: PropTypes.func.isRequired,
            showPinnedPosts: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        this.sidebarRight = React.createRef();
        this.state = {
            isOpened: false,
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.determineTransition);
        this.determineTransition();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.determineTransition);
        if (this.sidebarRight.current) {
            this.sidebarRight.current.removeEventListener('transitionend', this.onFinishTransition);
        }
    }

    componentDidUpdate(prevProps) {
        const wasOpen = prevProps.searchVisible || prevProps.postRightVisible;
        const isOpen = this.props.searchVisible || this.props.postRightVisible;

        if (!wasOpen && isOpen) {
            trackEvent('ui', 'ui_rhs_opened');
        }

        const {actions, isPinnedPosts, channel} = this.props;
        if (isPinnedPosts && prevProps.isPinnedPosts === isPinnedPosts && channel.id !== prevProps.channel.id) {
            actions.showPinnedPosts(channel.id);
        }
    }

    determineTransition = () => {
        const transitionInfo = window.getComputedStyle(this.sidebarRight.current).getPropertyValue('transition');
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

    render() {
        const {
            channel,
            currentUserId,
            isFlaggedPosts,
            isMentionSearch,
            isPinnedPosts,
            postRightVisible,
            postCardVisible,
            previousRhsState,
            searchVisible,
            isPluginView,
        } = this.props;

        let content = null;
        let expandedClass = '';

        if (this.props.isExpanded) {
            expandedClass = 'sidebar--right--expanded';
        }

        var searchForm = null;
        if (currentUserId) {
            searchForm = <SearchBar isFocus={searchVisible && !isFlaggedPosts && !isPinnedPosts}/>;
        }

        let channelDisplayName = '';
        if (channel) {
            if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                channelDisplayName = Utils.localizeMessage('rhs_root.direct', 'Direct Message');
            } else {
                channelDisplayName = channel.display_name;
            }
        }

        if (searchVisible) {
            content = (
                <div className='sidebar--right__content'>
                    <div className='search-bar__container channel-header alt'>{searchForm}</div>
                    <SearchResults
                        isMentionSearch={isMentionSearch}
                        isFlaggedPosts={isFlaggedPosts}
                        isPinnedPosts={isPinnedPosts}
                        toggleSize={this.toggleSize}
                        shrink={this.onShrink}
                        channelDisplayName={channelDisplayName}
                        isOpened={this.state.isOpened}
                    />
                </div>
            );
        } else if (postRightVisible) {
            content = (
                <div className='post-right__container'>
                    <FileUploadOverlay overlayType='right'/>
                    <div className='search-bar__container channel-header alt'>{searchForm}</div>
                    <RhsThread
                        previousRhsState={previousRhsState}
                        currentUserId={currentUserId}
                        toggleSize={this.toggleSize}
                        shrink={this.onShrink}
                    />
                </div>
            );
        } else if (isPluginView) {
            content = (
                <div className='post-right__container'>
                    <div className='search-bar__container channel-header alt'>{searchForm}</div>
                    <RhsPlugin/>
                </div>
            );
        } else if (postCardVisible) {
            content = (
                <div className='post-right__container'>
                    <div className='search-bar__container channel-header alt'>{searchForm}</div>
                    <RhsCard previousRhsState={previousRhsState}/>
                </div>
            );
        }

        if (!content) {
            expandedClass = '';
        }

        return (
            <div
                className={classNames('sidebar--right', expandedClass, {'move--left': this.props.isOpen})}
                id='sidebar-right'
                ref={this.sidebarRight}
            >
                <div
                    onClick={this.onShrink}
                    className='sidebar--right__bg'
                />
                <div className='sidebar-right-container'>
                    {content}
                </div>
            </div>
        );
    }
}
