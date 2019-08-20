// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {Posts} from 'mattermost-redux/constants';

import Constants from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import CreateComment from 'components/create_comment';
import DateSeparator from 'components/post_view/date_separator';
import FloatingTimestamp from 'components/post_view/floating_timestamp';
import RhsComment from 'components/rhs_comment';
import RhsHeaderPost from 'components/rhs_header_post';
import RhsRootPost from 'components/rhs_root_post';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

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
        currentUserId: PropTypes.string.isRequired,
        previewCollapsed: PropTypes.string.isRequired,
        previewEnabled: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            removePost: PropTypes.func.isRequired,
            selectPostCard: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        const openTime = (new Date()).getTime();

        this.state = {
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
            isScrolling: false,
            topRhsPostId: 0,
            openTime,
        };
    }

    componentDidMount() {
        this.scrollToBottom();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
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

        if (curLastPost.user_id === this.props.currentUserId) {
            this.scrollToBottom();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!Utils.areObjectsEqual(nextState.postsArray, this.props.posts)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.selected, this.props.selected)) {
            return true;
        }

        if (nextProps.previewEnabled !== this.props.previewEnabled) {
            return true;
        }

        if (nextState.isBusy !== this.state.isBusy) {
            return true;
        }

        if (nextState.isScrolling !== this.state.isScrolling) {
            return true;
        }

        if (nextState.topRhsPostId !== this.state.topRhsPostId) {
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

    handleCardClick = (post) => {
        if (!post) {
            return;
        }

        this.props.actions.selectPostCard(post);
    }

    handleCardClickPost = (post) => {
        if (!post) {
            return;
        }

        this.props.actions.selectPostCard(post);
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
            let topRhsPostId = '';
            const offset = 100;

            // determine the top rhs comment assuming that childNodes and postsArray are of same length
            for (let i = 0; i < childNodes.length; i++) {
                if ((childNodes[i].offsetTop + viewPort.top) - offset > 0) {
                    topRhsPostId = this.props.posts[i].id;
                    break;
                }
            }

            if (topRhsPostId !== this.state.topRhsPostId) {
                this.setState({
                    topRhsPostId,
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
        const {selected, currentUserId} = this.props;

        let createAt = selected.create_at;
        if (!createAt && this.props.posts.length > 0) {
            createAt = this.props.posts[this.props.posts.length - 1].create_at;
        }
        const rootPostDay = Utils.getDateForUnixTicks(createAt);
        let previousPostDay = rootPostDay;

        const commentsLists = [];
        const postsLength = postsArray.length;
        for (let i = 0; i < postsLength; i++) {
            const comPost = postsArray[i];
            const previousPostId = i > 0 ? postsArray[i - 1].id : '';

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

            commentsLists.push(
                <RhsComment
                    key={keyPrefix + 'commentKey'}
                    ref={comPost.id}
                    post={comPost}
                    previousPostId={previousPostId}
                    teamId={this.props.channel.team_id}
                    currentUserId={currentUserId}
                    isBusy={this.state.isBusy}
                    removePost={this.props.actions.removePost}
                    previewCollapsed={this.props.previewCollapsed}
                    previewEnabled={this.props.previewEnabled}
                    handleCardClick={this.handleCardClickPost}
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
                id='rhsContainer'
                className='sidebar-right__body'
                ref='sidebarbody'
            >
                <FloatingTimestamp
                    isScrolling={this.state.isScrolling}
                    isMobile={Utils.isMobile()}
                    postId={this.state.topRhsPostId}
                    isRhsPost={true}
                />
                <RhsHeaderPost
                    previousRhsState={this.props.previousRhsState}
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
                        <div
                            role='application'
                            id='rhsContent'
                            aria-label={Utils.localizeMessage('accessibility.sections.rhsContent', 'message details complimentary region')}
                            className='post-right__content a11y__region'
                            data-a11y-sort-order='3'
                            data-a11y-focus-child={true}
                            data-a11y-order-reversed={true}
                        >
                            {!isFakeDeletedPost && <DateSeparator date={rootPostDay}/>}
                            <RhsRootPost
                                ref={selected.id}
                                post={selected}
                                commentCount={postsLength}
                                teamId={this.props.channel.team_id}
                                currentUserId={this.props.currentUserId}
                                previewCollapsed={this.props.previewCollapsed}
                                previewEnabled={this.props.previewEnabled}
                                isBusy={this.state.isBusy}
                                handleCardClick={this.handleCardClick}
                            />
                            {isFakeDeletedPost && rootPostDay && <DateSeparator date={rootPostDay}/>}
                            <div
                                ref='rhspostlist'
                                className='post-right-comments-container'
                            >
                                {commentsLists}
                            </div>
                        </div>
                        {createComment}
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
