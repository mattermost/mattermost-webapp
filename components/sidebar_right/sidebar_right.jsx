// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {postListScrollChange} from 'actions/global_actions.jsx';
import PostStore from 'stores/post_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import FileUploadOverlay from 'components/file_upload_overlay.jsx';
import RhsThread from 'components/rhs_thread';
import SearchBar from 'components/search_bar';
import SearchResults from 'components/search_results';

export default class SidebarRight extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        currentUser: PropTypes.object,
        channel: PropTypes.object,
        postRightVisible: PropTypes.bool,
        searchVisible: PropTypes.bool,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        isPinnedPosts: PropTypes.bool,
        previousRhsState: PropTypes.string,
        actions: PropTypes.shape({
            getPinnedPosts: PropTypes.func,
            getFlaggedPosts: PropTypes.func,
        }),
    }

    constructor(props) {
        super(props);

        this.plScrolledToBottom = true;

        this.state = {
            expanded: false,
        };
    }

    componentDidMount() {
        PostStore.addPostPinnedChangeListener(this.onPostPinnedChange);
    }

    componentWillUnmount() {
        PostStore.removePostPinnedChangeListener(this.onPostPinnedChange);
    }

    componentWillReceiveProps(nextProps) {
        const isOpen = this.props.searchVisible || this.props.postRightVisible;
        const willOpen = nextProps.searchVisible || nextProps.postRightVisible;

        if (!isOpen && willOpen) {
            trackEvent('ui', 'ui_rhs_opened');
        }

        if (!isOpen && willOpen) {
            this.setState({
                expanded: false,
            });
        }
    }

    componentDidUpdate(prevProps) {
        const isOpen = this.props.searchVisible || this.props.postRightVisible;

        const wasOpen = prevProps.searchVisible || prevProps.postRightVisible;

        if (isOpen && !wasOpen) {
            setTimeout(() => postListScrollChange(), 0);
        }
    }

    onPostPinnedChange = () => {
        if (this.props.channel && this.props.isPinnedPosts) {
            this.props.actions.getPinnedPosts(this.props.channel.id);
        }
    }

    onShrink = () => {
        this.setState({
            expanded: false,
        });
    }

    toggleSize = () => {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        const {
            channel,
            currentUser,
            isFlaggedPosts,
            isMentionSearch,
            isPinnedPosts,
            postRightVisible,
            previousRhsState,
            searchVisible,
        } = this.props;

        let content = null;
        let expandedClass = '';

        if (this.state.expanded) {
            expandedClass = 'sidebar--right--expanded';
        }

        var searchForm = null;
        if (currentUser) {
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
                        isWebrtc={WebrtcStore.isBusy()}
                        currentUser={currentUser}
                        toggleSize={this.toggleSize}
                        shrink={this.onShrink}
                    />
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
