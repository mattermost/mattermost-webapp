// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isUserActivityPost} from 'mattermost-redux/utils/post_utils';

import EventTypes from 'utils/event_types.jsx';
import GlobalEventEmitter from 'utils/global_event_emitter.jsx';
import Constants, {PostTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {isFromWebhook} from 'utils/post_utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import CreateChannelIntroMessage from 'components/post_view/channel_intro_message';

import DateSeparator from 'components/post_view/date_separator.jsx';

import Post from 'components/post_view/post';

import NewMessageIndicator from './new_message_indicator.jsx';
import ScrollToBottomArrows from './scroll_to_bottom_arrows.jsx';
import FloatingTimestamp from './floating_timestamp.jsx';

const CLOSE_TO_BOTTOM_SCROLL_MARGIN = 10;

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         * Array of posts in the channel, ordered from oldest to newest
         */
        posts: PropTypes.array,

        /**
         * Flag used for removing !more message buttons
         */
        disableLoadingPosts: PropTypes.bool,

        /**
         * Timestamp used for populating new messages indicator
         */
        lastViewedAt: PropTypes.number,

        /**
         * Used for excluding own messages for new messages indicator
         */
        currentUserId: PropTypes.string,

        /**
         * Id used for focus of post.
         */
        focusedPostId: PropTypes.string,

        /**
         * Data used for determining more messages state at the bottom
         */
        newerPosts: PropTypes.shape({
            loading: PropTypes.bool,
            allLoaded: PropTypes.bool,
        }),

        /**
         * Data used for determining more messages state at the top
         */
        olderPosts: PropTypes.shape({
            loading: PropTypes.bool,
            allLoaded: PropTypes.bool,
        }),

        /**
         * Function to get older posts in the channel
         */
        loadOlderPosts: PropTypes.func.isRequired,

        /**
         * Function to get newer posts in the channel
         */
        loadNewerPosts: PropTypes.func.isRequired,

        /**
         * Function to set mobile view on resize
         */
        checkAndSetMobileView: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);
        this.postRefs = {};

        this.state = {
            atEnd: false,
            unViewedCount: 0,
            isDoingInitialLoad: true,
            isScrolling: false,
            lastViewed: props.lastViewedAt,
            lastPost: props.posts[0],
        };
    }

    getSnapshotBeforeUpdate() {
        const wasAtBottom = this.checkBottom();
        return {
            previousScrollTop: this.refs.postlist.scrollTop,
            previousScrollHeight: this.refs.postlist.scrollHeight,
            previousClientHeight: this.refs.postlist.clientHeight,
            wasAtBottom,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.posts[0].id === prevState.lastPost.id) {
            return null;
        }

        if (prevState.wasAtBottom) {
            return {
                lastPost: nextProps.posts[0],
            };
        }
        return {
            lastPost: nextProps.posts[0],
            unViewedCount: PostList.getUnreadPostsCount(nextProps.posts, nextProps.currentUserId, nextProps.lastViewedAt),
        };
    }

    componentDidMount() {
        this.initialScroll();
        GlobalEventEmitter.addListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.handleResize);
        window.addEventListener('resize', this.handleWindowResize);
        this.props.checkAndSetMobileView();
    }

    componentWillUnmount() {
        GlobalEventEmitter.removeListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.handleResize);
        window.removeEventListener('resize', this.handleWindowResize);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const postList = this.refs.postlist;
        const prevPosts = prevProps.posts;
        const posts = this.props.posts;
        if (postList && posts[0] && prevPosts[0]) {
            // A new message was posted, so scroll to bottom if user
            // was already scrolled close to bottom
            let doScrollToBottom = false;
            const postId = posts[0].id;
            const prevPostId = prevPosts[0].id;
            const pendingPostId = posts[0].pending_post_id;
            if (postId !== prevPostId && pendingPostId !== prevPostId) {
                // If already scrolled to bottom
                if (snapshot.wasAtBottom) {
                    doScrollToBottom = true;
                }

                // If new post was ephemeral
                if (Utils.isPostEphemeral(posts[0])) {
                    doScrollToBottom = true;
                }
            }

            if (doScrollToBottom) {
                postList.scrollTop = postList.scrollHeight;
                return;
            }

            // New posts added at the top, maintain scroll position
            if (snapshot.previousScrollHeight !== postList.scrollHeight && posts[0].id === prevPosts[0].id) {
                postList.scrollTop = snapshot.previousScrollTop + (postList.scrollHeight - snapshot.previousScrollHeight);
            }
        }
    }

    checkBottom = () => {
        if (!this.refs.postlist) {
            return true;
        }

        // No scroll bar so we're at the bottom
        if (this.refs.postlist.scrollHeight <= this.refs.postlist.clientHeight) {
            return true;
        }

        return this.refs.postlist.clientHeight + this.refs.postlist.scrollTop >= this.refs.postlist.scrollHeight - CLOSE_TO_BOTTOM_SCROLL_MARGIN;
    }

    initialScroll = () => {
        const postList = this.refs.postlist;
        const messageSeparator = this.postRefs.newMessageSeparator;

        // Scroll to new message indicator since we have unread posts and we can't show every new post in the screen
        if (messageSeparator && (postList.scrollHeight - messageSeparator.offsetTop) > postList.clientHeight) {
            messageSeparator.scrollIntoView();
            return true;
        }

        if (this.props.focusedPostId && this.postRefs[this.props.focusedPostId]) {
            const focusedPost = this.postRefs[this.props.focusedPostId];
            const rect = focusedPost.getBoundingClientRect();
            const listHeight = postList.clientHeight / 2;
            postList.scrollTop += rect.top - listHeight;
            return true;
        }

        // Scroll to bottom since we don't have unread posts or we can show every new post in the screen
        postList.scrollTop = postList.scrollHeight;

        return true;
    }

    handleScroll = () => {
        // Only count as user scroll if we've already performed our first load scroll
        if (!this.refs.postlist) {
            return;
        }

        this.updateFloatingTimestamp();

        if (!this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            });
        }

        if (this.checkBottom()) {
            this.setState({
                unViewedCount: 0,
                isScrolling: false,
            });
        }

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    handleScrollStop = () => {
        this.setState({
            isScrolling: false,
        });
    }

     handleResize = (forceScrollToBottom) => {
         const postList = this.refs.postlist;
         const messageSeparator = this.postRefs.newMessageSeparator;
         const doScrollToBottom = this.checkBottom() || forceScrollToBottom;

         if (postList) {
             if (doScrollToBottom) {
                 postList.scrollTop = postList.scrollHeight;
             } else if (!this.hasScrolled && messageSeparator) {
                 messageSeparator.scrollIntoView();
             }
         }

         this.props.checkAndSetMobileView();
     }

    updateFloatingTimestamp = () => {
        // skip this in non-mobile view since that's when the timestamp is visible
        if (!Utils.isMobile()) {
            return;
        }

        if (this.props.posts) {
            // iterate through posts starting at the bottom since users are more likely to be viewing newer posts
            for (let i = 0; i < this.props.posts.length; i++) {
                const post = this.props.posts[i];
                const element = this.postRefs[post.id];

                if (!element || element.offsetTop + element.clientHeight <= this.refs.postlist.scrollTop) {
                    // this post is off the top of the screen so the last one is at the top of the screen
                    let topPost;

                    if (i > 0) {
                        topPost = this.props.posts[i - 1];
                    } else {
                        // the first post we look at should always be on the screen, but handle that case anyway
                        topPost = post;
                    }

                    if (!this.state.topPost || topPost.id !== this.state.topPost.id) {
                        this.setState({
                            topPost,
                        });
                    }

                    break;
                }
            }
        }
    }

    scrollToBottom = () => {
        if (this.refs.postlist) {
            this.refs.postlist.scrollTop = this.refs.postlist.scrollHeight;
        }
    }

    postRefCallback = (element) => {
        if (element) {
            const postId = element.dataset.key;
            this.postRefs[postId] = element;
        }
    }

    createPosts = (posts) => {
        const postCtls = [];
        let previousPostDay = new Date(0);
        const lastViewed = this.props.lastViewedAt;
        let renderedLastViewed = false;
        const currentUserId = this.props.currentUserId;

        for (let i = posts.length - 1; i >= 0; i--) {
            const post = posts[i];

            if (
                post == null ||
                post.type === PostTypes.EPHEMERAL_ADD_TO_CHANNEL ||
                isUserActivityPost(post.type)
            ) {
                continue;
            }

            const postCtl = (
                <div
                    ref={this.postRefCallback}
                    data-key={post.id || post.pending_post_id}
                    key={post.id || post.pending_post_id}
                >
                    <Post
                        post={post}
                        lastPostCount={(i >= 0 && i < Constants.TEST_ID_COUNT) ? i : -1}
                        getPostList={this.getPostList}
                    />
                </div>
            );

            const currentPostDay = Utils.getDateForUnixTicks(post.create_at);
            if (currentPostDay.toDateString() !== previousPostDay.toDateString()) {
                postCtls.push(
                    <DateSeparator
                        key={currentPostDay.getTime()}
                        date={currentPostDay}
                    />
                );
            }

            const isNotCurrentUser = post.user_id !== currentUserId || isFromWebhook(post);
            if (isNotCurrentUser &&
                    lastViewed !== 0 &&
                    post.create_at > lastViewed &&
                    !Utils.isPostEphemeral(post) &&
                    !renderedLastViewed) {
                renderedLastViewed = true;

                // Temporary fix to solve ie11 rendering issue
                let newSeparatorId = '';
                if (!UserAgent.isInternetExplorer()) {
                    newSeparatorId = 'new_message_' + post.id;
                }
                postCtls.push(
                    <div
                        id={newSeparatorId}
                        key='unviewed'
                        ref={this.postRefCallback}
                        className='new-separator'
                        data-key={'newMessageSeparator'}
                    >
                        <hr
                            className='separator__hr'
                        />
                        <div className='separator__text'>
                            <FormattedMessage
                                id='posts_view.newMsg'
                                defaultMessage='New Messages'
                            />
                        </div>
                    </div>
                );
            }

            postCtls.push(postCtl);
            previousPostDay = currentPostDay;
        }

        return postCtls;
    }

    getPostList = () => {
        return this.refs.postlist;
    }

    static getUnreadPostsCount = (posts, currentUserId, lastViewedAt) => {
        //This can be different than the unViewedCount on the sidebar as sytem messages
        //are not considered for the count.
        return posts.reduce((count, post) => {
            if (post.create_at > lastViewedAt &&
                post.user_id !== currentUserId &&
                post.state !== Constants.POST_DELETED) {
                return count + 1;
            }
            return count;
        }, 0);
    }

    render() {
        const posts = this.props.posts;

        let topRow;
        let bottomRow;
        const topPostCreateAt = this.state.topPost ? this.state.topPost.create_at : 0;

        if (!this.props.olderPosts.allLoaded && !this.props.olderPosts.loading && !this.props.disableLoadingPosts) {
            topRow = (
                <button
                    className='more-messages-text theme style--none color--link'
                    onClick={this.props.loadOlderPosts}
                >
                    <FormattedMessage
                        id='posts_view.loadMore'
                        defaultMessage='Load more messages'
                    />
                </button>
            );
        }

        if (!this.props.newerPosts.allLoaded && !this.props.newerPosts.loading && !this.props.disableLoadingPosts) {
            bottomRow = (
                <button
                    className='more-messages-text theme style--none color--link'
                    onClick={this.props.loadNewerPosts}
                >
                    <FormattedMessage
                        id='posts_view.loadMore'
                        defaultMessage='Load more messages'
                    />
                </button>
            );
        }

        if (this.props.olderPosts.allLoaded) {
            topRow = (
                <CreateChannelIntroMessage/>
            );
        }

        return (
            <div id='post-list'>
                <FloatingTimestamp
                    isScrolling={this.state.isScrolling}
                    isMobile={Utils.isMobile()}
                    createAt={topPostCreateAt}
                />
                <ScrollToBottomArrows
                    isScrolling={this.state.isScrolling}
                    atBottom={this.checkBottom()}
                    onClick={this.scrollToBottom}
                />
                <NewMessageIndicator
                    newMessages={this.state.unViewedCount}
                    onClick={this.scrollToBottom}
                />
                <div
                    ref='postlist'
                    className='post-list-holder-by-time'
                    onScroll={this.handleScroll}
                >
                    <div className='post-list__table'>
                        <div
                            id='postListContent'
                            ref='postListContent'
                            className='post-list__content'
                        >
                            {topRow}
                            {this.createPosts(posts)}
                            {bottomRow}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
