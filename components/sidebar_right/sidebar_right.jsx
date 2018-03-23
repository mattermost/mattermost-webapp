// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {postListScrollChange} from 'actions/global_actions.jsx';
import PostStore from 'stores/post_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import FileUploadOverlay from 'components/file_upload_overlay.jsx';
import RhsThread from 'components/rhs_thread';
import SearchBar from 'components/search_bar';
import SearchResults from 'components/search_results';

export default class SidebarRight extends React.Component {
    static propTypes = {
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
            useMilitaryTime: PreferenceStore.getBool(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, Constants.Preferences.USE_MILITARY_TIME, false),
        };
    }

    componentDidMount() {
        PostStore.addPostPinnedChangeListener(this.onPostPinnedChange);
        PreferenceStore.addChangeListener(this.onPreferenceChange);
        this.doStrangeThings();
    }

    componentWillUnmount() {
        PostStore.removePostPinnedChangeListener(this.onPostPinnedChange);
        PreferenceStore.removeChangeListener(this.onPreferenceChange);
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

    doStrangeThings = () => {
        // We should have a better way to do this stuff
        // Hence the function name.
        $('.app__body .inner-wrap').removeClass('.move--right');
        $('.app__body .inner-wrap').addClass('move--left');
        $('.app__body .sidebar--left').removeClass('move--right');
        $('.multi-teams .team-sidebar').removeClass('move--right');
        $('.app__body .sidebar--right').addClass('move--left');

        if (!this.props.searchVisible && !this.props.postRightVisible) {
            $('.app__body .inner-wrap').removeClass('move--left').removeClass('move--right');
            $('.app__body .sidebar--right').removeClass('move--left');
            return (
                <div/>
            );
        }

        return null;
    }

    componentDidUpdate(prevProps) {
        const isOpen = this.props.searchVisible || this.props.postRightVisible;
        WebrtcStore.emitRhsChanged(isOpen);
        this.doStrangeThings();

        const wasOpen = prevProps.searchVisible || prevProps.postRightVisible;

        if (isOpen && !wasOpen) {
            setTimeout(() => postListScrollChange(), 0);
        }
    }

    onPreferenceChange = () => {
        this.setState({
            useMilitaryTime: PreferenceStore.getBool(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, Constants.Preferences.USE_MILITARY_TIME, false),
        });
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

        const {useMilitaryTime} = this.state;

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
                        useMilitaryTime={useMilitaryTime}
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
                        useMilitaryTime={useMilitaryTime}
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
                className={'sidebar--right ' + expandedClass}
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
