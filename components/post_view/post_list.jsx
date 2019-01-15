// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactDOM from 'react-dom';

import {isUserActivityPost} from 'mattermost-redux/utils/post_utils';

import Constants, {PostTypes, PostRequestTypes} from 'utils/constants.jsx';
import {isFromWebhook} from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import GlobalEventEmitter from 'utils/global_event_emitter.jsx';
import EventTypes from 'utils/event_types.jsx';

import DateSeparator from 'components/post_view/date_separator.jsx';
import Post from 'components/post_view/post';

import FloatingTimestamp from './floating_timestamp.jsx';
import NewMessageIndicator from './new_message_indicator.jsx';
import ScrollToBottomArrows from './scroll_to_bottom_arrows.jsx';
import CreateChannelIntroMessage from './channel_intro_message';

const CLOSE_TO_BOTTOM_SCROLL_MARGIN = 10;
const MAX_EXTRA_PAGES_LOADED = 10;
const MAX_NUMBER_OF_AUTO_RETRIES = 3;

const LOADPOSTS_MIN_HEIGHT = 300;
const LOADPOSTS_MAX_HEIGHT = 2500;
const LOADPOSTS_SCROLL_RATIO = 0.3;

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         * Array of posts in the channel, ordered from oldest to newest
         */
        posts: PropTypes.array,

        /**
         * Timestamp used for populating new messages indicator
         */
        lastViewedAt: PropTypes.number,

        /**
         * Used for excluding own messages for new messages indicator
         */
        currentUserId: PropTypes.string,

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
         * Used for disabling loading more messages
         */
        postVisibility: PropTypes.number,

        /**
         * Used for focussing post on load
         */
        focusedPostId: PropTypes.string,
    }

    constructor(props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        this.extraPagesLoaded = 0;
        this.scrolledToPosts = true;
        this.autoRetriesCount = 0;

        this.postListRef = React.createRef();
        this.postListContentRef = React.createRef();
        this.scrollAnimationFrame = null;
        this.resizeAnimationFrame = null;
        this.atBottom = false;

        this.state = {
            unViewedCount: 0,
            isScrolling: false,
            autoRetryEnable: true,
        };
    }

    componentDidMount() {
        GlobalEventEmitter.addListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.handleResize);
        window.addEventListener('resize', this.handleWindowResize);

        this.initialScroll();
    }

    componentWillUnmount() {
        GlobalEventEmitter.removeListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.handleResize);
        window.removeEventListener('resize', this.handleWindowResize);
    }

    getSnapshotBeforeUpdate() {
        if (this.postListRef.current) {
            const previousScrollTop = this.postListRef.current.scrollTop;
            const previousScrollHeight = this.postListRef.current.scrollHeight;
            const wasAtBottom = this.checkBottom() && this.props.newerPosts.allLoaded;

            return {
                previousScrollTop,
                previousScrollHeight,
                wasAtBottom,
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.previousScrollHeight = snapshot && snapshot.previousScrollHeight;
        this.loadPostsToFillScreenIfNecessary();

        // Do not update scrolling unless posts, visibility or intro message change
        if (this.props.posts === prevProps.posts && this.props.postVisibility === prevProps.postVisibility) {
            return;
        }

        const prevPosts = prevProps.posts || [];
        const posts = this.props.posts || [];

        if (this.props.focusedPostId == null) {
            const hasNewPosts = (prevPosts.length === 0 && posts.length > 0) || (prevPosts.length > 0 && posts.length > 0 && prevPosts[0].id !== posts[0].id);

            if (snapshot && !snapshot.wasAtBottom && hasNewPosts) {
                this.setUnreadsBelow(posts, this.props.currentUserId);
            }
        }

        const postList = this.postListRef.current;
        if (!postList) {
            return;
        }
        const postlistScrollHeight = postList.scrollHeight;

        if (postList && prevPosts && posts && posts[0] && prevPosts[0]) {
            // A new message was posted, so scroll to bottom if user
            // was already scrolled close to bottom
            let doScrollToBottom = false;
            const postId = posts[0].id;
            const prevPostId = prevPosts[0].id;
            const pendingPostId = posts[0].pending_post_id;
            if ((postId !== prevPostId || pendingPostId === prevPostId) && this.props.newerPosts.allLoaded) {
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
                this.atBottom = true;
                postList.scrollTop = postlistScrollHeight;
                return;
            }

            // New posts added at the top, maintain scroll position
            if (snapshot.previousScrollHeight !== postlistScrollHeight && (posts[0].id === prevPosts[0].id)) {
                window.requestAnimationFrame(() => {
                    postList.scrollTop = snapshot.previousScrollTop + (postlistScrollHeight - snapshot.previousScrollHeight);
                });
            }
        }
    }

    loadPostsToFillScreenIfNecessary = async () => {
        if (this.props.focusedPostId) {
            return;
        }

        if (this.props.olderPosts.loading) {
            // Should already be loading posts
            return;
        }

        if (!this.postListContentRef || !this.postListRef.current) {
            // No posts to load
            return;
        }

        if (this.props.olderPosts.allLoaded || this.postListContentRef.current.scrollHeight >= this.postListRef.current.clientHeight) {
            // Screen is full
            return;
        }

        if (this.extraPagesLoaded > MAX_EXTRA_PAGES_LOADED) {
            // Prevent this from loading a lot of pages in a channel with only hidden messages
            // Enable load more messages manual link
            this.setState({autoRetryEnable: false});
            return;
        }

        await this.loadMoreOlderPosts();
        this.extraPagesLoaded += 1;
    };

    // Scroll to new message indicator or bottom on first load. Returns true
    // if we just scrolled for the initial load.
    initialScroll = () => {
        const postList = this.postListRef.current;
        const {posts, focusedPostId} = this.props;

        const messageSeparator = this.refs.newMessageSeparator;

        if (focusedPostId) {
            const focusedPost = this.refs[this.props.focusedPostId];
            const element = ReactDOM.findDOMNode(focusedPost);
            const rect = element.getBoundingClientRect();
            const listHeight = postList.clientHeight / 2;
            postList.scrollTop = (rect.top - listHeight) + postList.scrollTop;
            this.atBottom = this.checkBottom();
        } else if (messageSeparator && (postList.scrollHeight - messageSeparator.offsetTop) > postList.clientHeight) {
            // Scroll to new message indicator since we have unread posts and we can't show every new post in the screen
            messageSeparator.scrollIntoView();
            this.setUnreadsBelow(posts, this.props.currentUserId);
        } else {
            // Scroll to bottom since we don't have unread posts or we can show every new post in the screen
            this.atBottom = true;
            postList.scrollTop = postList.scrollHeight;
        }
    }

    setUnreadsBelow = (posts, currentUserId) => {
        const unViewedCount = posts.reduce((count, post) => {
            if (post.create_at > this.state.lastViewed &&
                post.user_id !== currentUserId &&
                post.state !== Constants.POST_DELETED) {
                return count + 1;
            }
            return count;
        }, 0);
        this.setState({unViewedCount});
    }

    handleScrollStop = () => {
        this.setState({
            isScrolling: false,
        });
    }

    checkBottom = () => {
        if (!this.postListRef.current) {
            return true;
        }
        const postlistScrollHeight = this.postListRef.current.scrollHeight;
        const postlistClientHeight = this.postListRef.current.clientHeight;

        // No scroll bar so we're at the bottom
        if (postlistScrollHeight <= postlistClientHeight) {
            return true;
        }

        return postlistClientHeight + this.postListRef.current.scrollTop >= postlistScrollHeight - CLOSE_TO_BOTTOM_SCROLL_MARGIN;
    }

    handleWindowResize = () => {
        this.handleResize();
    }

    handleResize = (forceScrollToBottom) => {
        if (this.resizeAnimationFrame) {
            window.cancelAnimationFrame(this.resizeAnimationFrame);
        }

        this.resizeAnimationFrame = window.requestAnimationFrame(() => {
            const postList = this.postListRef.current;
            const messageSeparator = this.refs.newMessageSeparator;
            const doScrollToBottom = (this.atBottom && this.props.newerPosts.allLoaded) || forceScrollToBottom;

            if (postList) {
                if (doScrollToBottom) {
                    postList.scrollTop = postList.scrollHeight;
                } else if (messageSeparator) {
                    const element = ReactDOM.findDOMNode(messageSeparator);
                    element.scrollIntoView();
                    this.atBottom = this.checkBottom();
                }
                this.previousScrollHeight = postList.scrollHeight;
            }

            // this.props.actions.checkAndSetMobileView();
        });
    }

    loadMoreOlderPosts = () => {
        return this.loadMorePosts(PostRequestTypes.BEFORE_ID);
    }

    loadMoreNewerPosts = () => {
        this.loadingNewPosts = true;
        return this.loadMorePosts(PostRequestTypes.AFTER_ID);
    }

    loadMorePosts = async (type) => {
        let error;
        if (type === PostRequestTypes.BEFORE_ID) {
            ({error} = await this.props.loadOlderPosts());
        } else {
            ({error} = await this.props.loadNewerPosts());
        }

        if (error) {
            if (this.autoRetriesCount < MAX_NUMBER_OF_AUTO_RETRIES) {
                this.autoRetriesCount++;
                if (type === PostRequestTypes.BEFORE_ID) {
                    this.loadMoreOlderPosts();
                } else {
                    this.loadMoreNewerPosts();
                }
            } else {
                this.setState({autoRetryEnable: false});
            }
        } else {
            this.setState({
                autoRetryEnable: true,
            });
            if (!this.state.autoRetryEnable) {
                this.autoRetriesCount = 0;
            }
            this.loadingNewPosts = false;
        }
    }

    handleScroll = () => {
        if (this.scrollAnimationFrame) {
            window.cancelAnimationFrame(this.scrollAnimationFrame);
        }

        this.scrollAnimationFrame = window.requestAnimationFrame(() => {
            // Only count as user scroll if we've already performed our first load scroll
            const postList = this.postListRef.current;
            const postListScrollTop = postList.scrollTop;
            const postlistScrollHeight = postList.scrollHeight;

            if (postlistScrollHeight === this.previousScrollHeight) {
                this.atBottom = this.checkBottom();
            }

            this.updateFloatingTimestamp();

            if (!this.state.isScrolling) {
                this.setState({
                    isScrolling: true,
                });
            }

            if (this.checkBottom()) {
                this.setState({
                    lastViewed: new Date().getTime(),
                    unViewedCount: 0,
                    isScrolling: false,
                });
            }

            let shouldLoadOldPosts = false;
            let shouldLoadNewPosts = false;

            const postlistClientHeight = postList.clientHeight;
            const scrollHeightAoveFoldForLoad = LOADPOSTS_SCROLL_RATIO * (postList.scrollHeight - postList.clientHeight);

            if (postListScrollTop < LOADPOSTS_MIN_HEIGHT) {
                shouldLoadOldPosts = true;
            } else if ((postListScrollTop < LOADPOSTS_MAX_HEIGHT) && (postListScrollTop < scrollHeightAoveFoldForLoad)) {
                shouldLoadOldPosts = true;
            } else if (postlistClientHeight + postListScrollTop >= postlistScrollHeight - LOADPOSTS_MIN_HEIGHT) {
                shouldLoadNewPosts = true;
            }

            if (shouldLoadOldPosts && !this.props.olderPosts.loading && !this.props.olderPosts.allLoaded && this.state.autoRetryEnable) {
                this.loadMoreOlderPosts();
            }

            if (shouldLoadNewPosts && !this.props.newerPosts.loading && !this.props.newerPosts.allLoaded && this.state.autoRetryEnable) {
                this.loadingNewPosts = true;
                this.loadMoreNewerPosts();
            }

            this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
        });
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
                const element = this.refs[post.id];
                const domNode = ReactDOM.findDOMNode(element);

                if (!element || !domNode || domNode.offsetTop + domNode.clientHeight <= this.postListRef.current.scrollTop) {
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
        if (this.postListRef.current) {
            this.postListRef.current.scrollTop = this.postListRef.current.scrollHeight;
        }
    }

    createPosts = (posts) => {
        const postCtls = [];
        let previousPostDay = new Date(0);
        const currentUserId = this.props.currentUserId;
        const lastViewed = this.props.lastViewedAt || 0;

        let renderedLastViewed = false;

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
                <Post
                    ref={post.id}
                    key={'post ' + (post.id || post.pending_post_id)}
                    post={post}
                    lastPostCount={(i >= 0 && i < Constants.TEST_ID_COUNT) ? i : -1}
                    getPostList={this.getPostList}
                />
            );

            const currentPostDay = Utils.getDateForUnixTicks(post.create_at);
            if (currentPostDay.toDateString() !== previousPostDay.toDateString()) {
                postCtls.push(
                    <DateSeparator
                        key={currentPostDay}
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
                        ref='newMessageSeparator'
                        className='new-separator'
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
        return this.postListRef.current;
    }

    makeLoadingPlaceHolder = () => {
        return (
            <div
                className='loading-screen'
            >
                <div className='loading__content'>
                    <div className='round round-1'/>
                    <div className='round round-2'/>
                    <div className='round round-3'/>
                </div>
            </div>
        );
    }

    makeLoadMoreMessagesHandler = (type) => {
        const clickHandler = type === 'top' ? this.loadMoreOlderPosts : this.loadMoreNewerPosts;

        return (
            <button
                ref='loadmoretop'
                className='more-messages-text theme style--none color--link'
                onClick={clickHandler}
            >
                <FormattedMessage
                    id='posts_view.loadMore'
                    defaultMessage='Load more messages'
                />
            </button>
        );
    }

    makeMaxMessagesLoadedMessage = () => {
        return (
            <div className='post-list__loading post-list__loading-search'>
                <FormattedMessage
                    id='posts_view.maxLoaded'
                    defaultMessage='Looking for a specific message? Try searching for it'
                />
            </div>
        );
    }

    render() {
        const posts = this.props.posts || [];

        let topRow;
        let bottomRow;
        if (this.props.postVisibility >= Constants.MAX_POST_VISIBILITY) {
            topRow = this.makeMaxMessagesLoadedMessage();
            bottomRow = topRow;
        } else if (this.state.autoRetryEnable) {
            topRow = this.makeLoadingPlaceHolder();
            bottomRow = topRow;
        } else {
            topRow = this.makeLoadMoreMessagesHandler('top');
            bottomRow = this.makeLoadMoreMessagesHandler('bottom');
        }

        if (this.props.olderPosts.allLoaded) {
            topRow = (
                <CreateChannelIntroMessage/>
            );
        }

        if (this.props.newerPosts.allLoaded) {
            bottomRow = null;
        }

        const topPostCreateAt = this.state.topPost ? this.state.topPost.create_at : 0;

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
                    ref={this.postListRef}
                    className='post-list-holder-by-time'
                    onScroll={this.handleScroll}
                >
                    <div className='post-list__table'>
                        <div
                            id='postListContent'
                            ref={this.postListContentRef}
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
