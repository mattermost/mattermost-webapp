// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {Posts} from 'mattermost-redux/constants';

import PreferenceStore from 'stores/preference_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import Constants from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import CreateComment from 'components/create_comment';
import DateSeparator from 'components/post_view/date_separator.jsx';
import FloatingTimestamp from 'components/post_view/floating_timestamp.jsx';
import RhsComment from 'components/rhs_comment';
import RhsHeaderPost from 'components/rhs_header_post';
import RootPost from 'components/rhs_root_post';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

const Preferences = Constants.Preferences;

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

export default class RhsThread extends React.Component {
    static propTypes = {
        posts: PropTypes.arrayOf(PropTypes.object).isRequired,
        channel: PropTypes.object.isRequired,
        selected: PropTypes.object.isRequired,
        previousRhsState: PropTypes.string,
        isWebrtc: PropTypes.bool,
        currentUser: PropTypes.object.isRequired,
        previewCollapsed: PropTypes.string.isRequired,
        previewEnabled: PropTypes.bool.isRequired,
        postsEmbedVisibleObj: PropTypes.object,
        actions: PropTypes.shape({
            removePost: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        const openTime = (new Date()).getTime();

        this.state = {
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
            profiles: JSON.parse(JSON.stringify(UserStore.getProfiles())),
            compactDisplay: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            flaggedPosts: PreferenceStore.getCategory(Constants.Preferences.CATEGORY_FLAGGED_POST),
            statuses: Object.assign({}, UserStore.getStatuses()),
            previewsCollapsed: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, 'false'),
            isBusy: WebrtcStore.isBusy(),
            isScrolling: false,
            topRhsPostCreateAt: 0,
            openTime,
        };
    }

    componentDidMount() {
        PreferenceStore.addChangeListener(this.onPreferenceChange);
        UserStore.addChangeListener(this.onUserChange);
        UserStore.addStatusesChangeListener(this.onStatusChange);
        WebrtcStore.addBusyListener(this.onBusy);

        this.scrollToBottom();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        PreferenceStore.removeChangeListener(this.onPreferenceChange);
        UserStore.removeChangeListener(this.onUserChange);
        UserStore.removeStatusesChangeListener(this.onStatusChange);
        WebrtcStore.removeBusyListener(this.onBusy);

        window.removeEventListener('resize', this.handleResize);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (!this.props.selected || !nextProps.selected) {
            return;
        }

        if (this.props.selected.id !== nextProps.selected.id) {
            this.setState({
                openTime: (new Date()).getTime(),
            });
        }
    }

    componentDidUpdate(prevProps) {
        const prevPostsArray = prevProps.posts || [];
        const curPostsArray = this.props.posts || [];

        if (prevPostsArray.length >= curPostsArray.length) {
            return;
        }

        const curLastPost = curPostsArray[curPostsArray.length - 1];

        if (curLastPost.user_id === UserStore.getCurrentId()) {
            this.scrollToBottom();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!Utils.areObjectsEqual(nextState.statuses, this.state.statuses)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.postsArray, this.props.posts)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.selected, this.props.selected)) {
            return true;
        }

        if (nextState.compactDisplay !== this.state.compactDisplay) {
            return true;
        }

        if (nextProps.previewEnabled !== this.props.previewEnabled) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.flaggedPosts, this.state.flaggedPosts)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.profiles, this.state.profiles)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextProps.currentUser, this.props.currentUser)) {
            return true;
        }

        if (nextState.isBusy !== this.state.isBusy) {
            return true;
        }

        if (nextState.isScrolling !== this.state.isScrolling) {
            return true;
        }

        if (nextState.topRhsPostCreateAt !== this.state.topRhsPostCreateAt) {
            return true;
        }
        if (nextProps.postsEmbedVisibleObj !== this.props.postsEmbedVisibleObj) {
            return true;
        }

        return false;
    }

    handleResize = () => {
        this.setState({
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
        });

        if (UserAgent.isMobile() && document.activeElement.id === 'reply_textbox') {
            this.scrollToBottom();
        }
    }

    onPreferenceChange = () => {
        this.setState({
            compactDisplay: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            flaggedPosts: PreferenceStore.getCategory(Constants.Preferences.CATEGORY_FLAGGED_POST),
        });
    }

    onStatusChange = () => {
        this.setState({statuses: Object.assign({}, UserStore.getStatuses())});
    }

    onBusy = (isBusy) => {
        this.setState({isBusy});
    }

    filterPosts = (posts, selected, openTime) => {
        const postsArray = [];

        posts.forEach((cpost) => {
            // Do not show empherals created before sidebar has been opened
            if (cpost.type === 'system_ephemeral' && cpost.create_at < openTime) {
                return;
            }

            if (cpost.root_id === selected.id) {
                postsArray.unshift(cpost);
            }
        });

        return postsArray;
    }

    onUserChange = () => {
        const profiles = JSON.parse(JSON.stringify(UserStore.getProfiles()));
        this.setState({profiles});
    }

    scrollToBottom = () => {
        if ($('.post-right__scroll')[0]) {
            $('.post-right__scroll').parent().scrollTop($('.post-right__scroll')[0].scrollHeight);
        }
    }

    updateFloatingTimestamp = () => {
        // skip this in non-mobile view since that's when the timestamp is visible
        if (!Utils.isMobile()) {
            return;
        }

        if (this.props.posts) {
            const childNodes = this.refs.rhspostlist.childNodes;
            const viewPort = this.refs.rhspostlist.getBoundingClientRect();
            let topRhsPostCreateAt = 0;
            const offset = 100;

            // determine the top rhs comment assuming that childNodes and postsArray are of same length
            for (let i = 0; i < childNodes.length; i++) {
                if ((childNodes[i].offsetTop + viewPort.top) - offset > 0) {
                    topRhsPostCreateAt = this.props.posts[i].create_at;
                    break;
                }
            }

            if (topRhsPostCreateAt !== this.state.topRhsPostCreateAt) {
                this.setState({
                    topRhsPostCreateAt,
                });
            }
        }
    }

    handleScroll = () => {
        this.updateFloatingTimestamp();

        if (!this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            });
        }

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    handleScrollStop = () => {
        this.setState({
            isScrolling: false,
        });
    }

    getSidebarBody = () => {
        return this.refs.sidebarbody;
    }

    render() {
        if (this.props.posts == null || this.props.selected == null) {
            return (
                <div/>
            );
        }

        const postsArray = this.filterPosts(this.props.posts, this.props.selected, this.state.openTime);
        const selected = this.props.selected;
        const profiles = this.state.profiles || {};

        let profile;
        if (UserStore.getCurrentId() === selected.user_id) {
            profile = this.props.currentUser;
        } else {
            profile = profiles[selected.user_id];
        }

        let isRootFlagged = false;
        if (this.state.flaggedPosts) {
            isRootFlagged = this.state.flaggedPosts.get(selected.id) != null;
        }

        let rootStatus = 'offline';
        if (this.state.statuses) {
            rootStatus = this.state.statuses[selected.user_id] || 'offline';
        }

        let createAt = selected.create_at;
        if (!createAt) {
            createAt = this.props.posts[this.props.posts.length - 1].create_at;
        }
        const rootPostDay = Utils.getDateForUnixTicks(createAt);
        let previousPostDay = rootPostDay;

        const commentsLists = [];
        const postsLength = postsArray.length;
        for (let i = 0; i < postsLength; i++) {
            const comPost = postsArray[i];
            let p;
            if (UserStore.getCurrentId() === comPost.user_id) {
                p = UserStore.getCurrentUser();
            } else {
                p = profiles[comPost.user_id];
            }

            let isFlagged = false;
            if (this.state.flaggedPosts) {
                isFlagged = this.state.flaggedPosts.get(comPost.id) != null;
            }

            let status = 'offline';
            if (this.state.statuses && p && p.id) {
                status = this.state.statuses[p.id] || 'offline';
            }

            const currentPostDay = Utils.getDateForUnixTicks(comPost.create_at);
            if (currentPostDay.toDateString() !== previousPostDay.toDateString()) {
                previousPostDay = currentPostDay;
                commentsLists.push(
                    <DateSeparator
                        key={currentPostDay}
                        date={currentPostDay}
                    />);
            }

            const keyPrefix = comPost.id ? comPost.id : comPost.pending_post_id;
            const reverseCount = postsLength - i - 1;
            commentsLists.push(
                <RhsComment
                    key={keyPrefix + 'commentKey'}
                    ref={comPost.id}
                    post={comPost}
                    teamId={this.props.channel.team_id}
                    lastPostCount={(reverseCount >= 0 && reverseCount < Constants.TEST_ID_COUNT) ? reverseCount : -1}
                    user={p}
                    currentUser={this.props.currentUser}
                    compactDisplay={this.state.compactDisplay}
                    isFlagged={isFlagged}
                    status={status}
                    isBusy={this.state.isBusy}
                    removePost={this.props.actions.removePost}
                    previewCollapsed={this.props.previewCollapsed}
                    previewEnabled={this.props.previewEnabled}
                    isEmbedVisible={this.props.postsEmbedVisibleObj[comPost.id]}
                />
            );
        }

        let createComment;
        const isFakeDeletedPost = selected.type === Constants.PostTypes.FAKE_PARENT_DELETED;
        const channelIsArchived = this.props.channel.delete_at !== 0;
        if (!isFakeDeletedPost) {
            if (channelIsArchived) {
                createComment = (
                    <div className='channel-archived-warning'>
                        <FormattedMarkdownMessage
                            id='archivedChannelMessage'
                            defaultMessage='You are viewing an **archived channel**. New messages cannot be posted.'
                        />
                    </div>
                );
            } else {
                createComment = (
                    <div className='post-create__container'>
                        <CreateComment
                            channelId={selected.channel_id}
                            rootId={selected.id}
                            rootDeleted={selected.state === Posts.POST_DELETED}
                            latestPostId={postsLength > 0 ? postsArray[postsLength - 1].id : selected.id}
                            getSidebarBody={this.getSidebarBody}
                        />
                    </div>
                );
            }
        }

        if (this.props.channel.type === Constants.DM_CHANNEL) {
            const teammate = Utils.getDirectTeammate(this.props.channel.id);
            if (teammate && teammate.delete_at) {
                createComment = (
                    <div
                        className='post-create-message'
                    >
                        <FormattedMessage
                            id='create_post.deactivated'
                            defaultMessage='You are viewing an archived channel with a deactivated user.'
                        />
                    </div>
                );
            }
        }

        return (
            <div
                className='sidebar-right__body'
                ref='sidebarbody'
            >
                <FloatingTimestamp
                    isScrolling={this.state.isScrolling}
                    isMobile={Utils.isMobile()}
                    createAt={this.state.topRhsPostCreateAt}
                    isRhsPost={true}
                />
                <RhsHeaderPost
                    previousRhsState={this.props.previousRhsState}
                    isWebrtc={this.props.isWebrtc}
                />
                <Scrollbars
                    autoHide={true}
                    autoHideTimeout={500}
                    autoHideDuration={500}
                    renderThumbHorizontal={renderThumbHorizontal}
                    renderThumbVertical={renderThumbVertical}
                    renderView={renderView}
                    onScroll={this.handleScroll}
                >
                    <div className='post-right__scroll'>
                        {!isFakeDeletedPost && <DateSeparator date={rootPostDay}/>}
                        <RootPost
                            ref={selected.id}
                            post={selected}
                            commentCount={postsLength}
                            user={profile}
                            teamId={this.props.channel.team_id}
                            currentUser={this.props.currentUser}
                            compactDisplay={this.state.compactDisplay}
                            isFlagged={isRootFlagged}
                            status={rootStatus}
                            previewCollapsed={this.props.previewCollapsed}
                            previewEnabled={this.props.previewEnabled}
                            isBusy={this.state.isBusy}
                            isEmbedVisible={this.props.postsEmbedVisibleObj[selected.id]}
                        />
                        {isFakeDeletedPost && <DateSeparator date={rootPostDay}/>}
                        <div
                            ref='rhspostlist'
                            className='post-right-comments-container'
                        >
                            {commentsLists}
                        </div>
                        {createComment}
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
