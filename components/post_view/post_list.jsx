// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {isUserActivityPost} from 'mattermost-redux/utils/post_utils';

import Constants, {PostTypes} from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import EventTypes from 'utils/event_types.jsx';
import GlobalEventEmitter from 'utils/global_event_emitter.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import {isFromWebhook} from 'utils/post_utils.jsx';

import LoadingScreen from 'components/loading_screen.jsx';
import DateSeparator from 'components/post_view/date_separator.jsx';

import FloatingTimestamp from './floating_timestamp.jsx';
import NewMessageIndicator from './new_message_indicator.jsx';
import Post from './post';
import ScrollToBottomArrows from './scroll_to_bottom_arrows.jsx';
import CreateChannelIntroMessage from './channel_intro_message';

const CLOSE_TO_BOTTOM_SCROLL_MARGIN = 10;
const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;
const MAX_EXTRA_PAGES_LOADED = 10;
const MAX_NUMBER_OF_AUTO_RETRIES = 3;

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         * Array of posts in the channel, ordered from oldest to newest
         */
        posts: PropTypes.array,

        /**
         * The number of posts that should be rendered
         */
        postVisibility: PropTypes.number,

        /**
         * The channel the posts are in
         */
        channel: PropTypes.object.isRequired,

        /**
         * The last time the channel was viewed, sets the new message separator
         */
        lastViewedAt: PropTypes.number,

        /**
         * The user id of the logged in user
         */
        currentUserId: PropTypes.string,

        /**
         * Set to focus this post
         */
        focusedPostId: PropTypes.string,

        /**
         * Whether to display the channel intro at full width
         */
        fullWidth: PropTypes.bool,

        actions: PropTypes.shape({

            /**
             * Function to get posts in the channel
             */
            getPosts: PropTypes.func.isRequired,

            /**
             * Function to get posts in the channel older than the focused post
             */
            getPostsBefore: PropTypes.func.isRequired,

            /**
             * Function to get posts in the channel newer than the focused post
             */
            getPostsAfter: PropTypes.func.isRequired,

            /**
             * Function to get the post thread for the focused post
             */
            getPostThread: PropTypes.func.isRequired,

            /**
             * Function to increase the number of posts being rendered
             */
            increasePostVisibility: PropTypes.func.isRequired,

            /**
             * Function to check and set if app is in mobile view
             */
            checkAndSetMobileView: PropTypes.func.isRequired,
        }).isRequired,
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
            atEnd: false,
            unViewedCount: 0,
            isDoingInitialLoad: true,
            isScrolling: false,
            lastViewed: props.lastViewedAt,
            autoRetryEnable: true,
        };
    }

    componentDidMount() {
        this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        this.props.actions.checkAndSetMobileView();
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
            const wasAtBottom = this.checkBottom();

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
        if (this.props.focusedPostId && this.props.focusedPostId !== prevProps.focusedPostId) {
            this.hasScrolledToFocusedPost = false;
            this.hasScrolledToNewMessageSeparator = false;
            this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        } else if (this.props.channel && (!prevProps.channel || this.props.channel.id !== prevProps.channel.id)) {
            this.hasScrolled = false;
            this.hasScrolledToFocusedPost = false;
            this.hasScrolledToNewMessageSeparator = false;
            this.atBottom = false;
            this.extraPagesLoaded = 0;

            this.setState({atEnd: false, isDoingInitialLoad: !this.props.posts, unViewedCount: 0}); // eslint-disable-line react/no-did-update-set-state

            this.loadPosts(this.props.channel.id);
        }

        this.loadPostsToFillScreenIfNecessary();

        // Do not update scrolling unless posts, visibility or intro message change
        if (this.props.posts === prevProps.posts && this.props.postVisibility === prevProps.postVisibility && this.state.atEnd === prevState.atEnd && this.state.loadingPosts === prevState.loadingPosts) {
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

        // Scroll to focused post on first load
        const focusedPost = this.refs[this.props.focusedPostId];
        if (focusedPost && this.props.posts) {
            if (!this.hasScrolledToFocusedPost) {
                const element = ReactDOM.findDOMNode(focusedPost);
                const rect = element.getBoundingClientRect();
                const listHeight = postList.clientHeight / 2;
                postList.scrollTop = (rect.top - listHeight) + postList.scrollTop;
                this.atBottom = this.checkBottom();
            } else if (snapshot.previousScrollHeight !== postlistScrollHeight && posts[0].id === prevPosts[0].id) {
                postList.scrollTop = snapshot.previousScrollTop + (postlistScrollHeight - snapshot.previousScrollHeight);
            }
            return;
        }

        const didInitialScroll = this.initialScroll();

        if (posts.length >= POSTS_PER_PAGE) {
            this.hasScrolledToNewMessageSeparator = true;
        }

        if (didInitialScroll) {
            return;
        }

        if (postList && prevPosts && posts && posts[0] && prevPosts[0]) {
            // A new message was posted, so scroll to bottom if user
            // was already scrolled close to bottom
            let doScrollToBottom = false;
            const postId = posts[0].id;
            const prevPostId = prevPosts[0].id;
            const pendingPostId = posts[0].pending_post_id;
            if (postId !== prevPostId || pendingPostId === prevPostId) {
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
            if (snapshot.previousScrollHeight !== postlistScrollHeight && posts[0].id === prevPosts[0].id) {
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

        if (this.state.isDoingInitialLoad || this.state.loadingPosts) {
            // Should already be loading posts
            return;
        }

        if (!this.postListContentRef || !this.postListRef.current) {
            // No posts to load
            return;
        }

        if (this.state.atEnd || this.postListContentRef.current.scrollHeight >= this.postListRef.current.clientHeight) {
            // Screen is full
            return;
        }

        if (this.extraPagesLoaded > MAX_EXTRA_PAGES_LOADED) {
            // Prevent this from loading a lot of pages in a channel with only hidden messages
            // Enable load more messages manual link
            this.setState({autoRetryEnable: false});
            return;
        }

        await this.loadMorePosts();
        this.extraPagesLoaded += 1;
    };

    // Scroll to new message indicator or bottom on first load. Returns true
    // if we just scrolled for the initial load.
    initialScroll = () => {
        if (this.hasScrolledToNewMessageSeparator) {
            // Already scrolled to new messages indicator
            return false;
        }

        const postList = this.postListRef.current;
        const posts = this.props.posts;
        if (!postList || !posts) {
            // Not able to do initial scroll yet
            return false;
        }

        const messageSeparator = this.refs.newMessageSeparator;

        // Scroll to new message indicator since we have unread posts and we can't show every new post in the screen
        if (messageSeparator && (postList.scrollHeight - messageSeparator.offsetTop) > postList.clientHeight) {
            messageSeparator.scrollIntoView();
            this.setUnreadsBelow(posts, this.props.currentUserId);
            return true;
        }

        // Scroll to bottom since we don't have unread posts or we can show every new post in the screen
        this.atBottom = true;
        postList.scrollTop = postList.scrollHeight;
        return true;
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
            const doScrollToBottom = this.atBottom || forceScrollToBottom;

            if (postList) {
                if (doScrollToBottom) {
                    postList.scrollTop = postList.scrollHeight;
                } else if (!this.hasScrolled && messageSeparator) {
                    const element = ReactDOM.findDOMNode(messageSeparator);
                    element.scrollIntoView();
                    this.atBottom = this.checkBottom();
                }
                this.previousScrollHeight = postList.scrollHeight;
            }
            this.props.actions.checkAndSetMobileView();
        });
    }

    loadPosts = async (channelId, focusedPostId) => {
        let posts;
        if (focusedPostId) {
            const getPostThreadAsync = this.props.actions.getPostThread(focusedPostId, false);
            const getPostsBeforeAsync = this.props.actions.getPostsBefore(channelId, focusedPostId, 0, POSTS_PER_PAGE);
            const getPostsAfterAsync = this.props.actions.getPostsAfter(channelId, focusedPostId, 0, POSTS_PER_PAGE);

            const result = await getPostsBeforeAsync;
            posts = result.data;
            await getPostsAfterAsync;
            await getPostThreadAsync;

            this.hasScrolledToFocusedPost = true;
        } else {
            const result = await this.props.actions.getPosts(channelId, 0, POSTS_PER_PAGE);
            posts = result.data;

            if (!this.checkBottom()) {
                const postsArray = posts.order.map((id) => posts.posts[id]);
                this.setUnreadsBelow(postsArray, this.props.currentUserId);
            }

            this.hasScrolledToNewMessageSeparator = true;
        }

        this.setState({
            isDoingInitialLoad: false,
            atEnd: Boolean(posts && posts.order.length < POSTS_PER_PAGE),
        });
    }

    loadMorePosts = async () => {
        const {moreToLoad, error} = await this.props.actions.increasePostVisibility(this.props.channel.id, this.props.focusedPostId);
        if (error) {
            if (this.autoRetriesCount < MAX_NUMBER_OF_AUTO_RETRIES) {
                this.autoRetriesCount++;
                this.loadMorePosts();
            } else {
                this.setState({autoRetryEnable: false});
            }
        } else {
            this.setState({
                atEnd: !moreToLoad && this.props.posts.length < this.props.postVisibility,
                autoRetryEnable: true,
                loadingPosts: false,
            });
            if (!this.state.autoRetryEnable) {
                this.autoRetriesCount = 0;
            }
        }
    }

    handleScroll = () => {
        if (this.scrollAnimationFrame) {
            window.cancelAnimationFrame(this.scrollAnimationFrame);
        }

        this.scrollAnimationFrame = window.requestAnimationFrame(() => {
            // Only count as user scroll if we've already performed our first load scroll
            this.hasScrolled = this.hasScrolledToNewMessageSeparator || this.hasScrolledToFocusedPost;
            const postList = this.postListRef.current;

            if (postList.scrollHeight === this.previousScrollHeight) {
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

            if (postList.scrollTop <= 0.5 * postList.clientHeight && !this.state.loadingPosts && !this.state.atEnd && this.state.autoRetryEnable) {
                this.setState({loadingPosts: true});
                this.loadMorePosts();
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

    render() {
        const posts = this.props.posts || [];
        const channel = this.props.channel;

        if ((posts.length === 0 && this.state.isDoingInitialLoad) || channel == null) {
            return (
                <div id='post-list'>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        }

        let topRow;
        if (this.state.atEnd) {
            topRow = (
                <CreateChannelIntroMessage
                    channel={channel}
                    fullWidth={this.props.fullWidth}
                />
            );
        } else if (this.props.postVisibility >= Constants.MAX_POST_VISIBILITY) {
            topRow = (
                <div className='post-list__loading post-list__loading-search'>
                    <FormattedMessage
                        id='posts_view.maxLoaded'
                        defaultMessage='Looking for a specific message? Try searching for it'
                    />
                </div>
            );
        } else if (this.state.isDoingInitialLoad) {
            topRow = <LoadingScreen style={{height: '0px'}}/>;
        } else if (this.state.autoRetryEnable) {
            topRow = (
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
        } else {
            topRow = (
                <button
                    ref='loadmoretop'
                    className='more-messages-text theme style--none color--link'
                    onClick={this.loadMorePosts}
                >
                    <FormattedMessage
                        id='posts_view.loadMore'
                        defaultMessage='Load more messages'
                    />
                </button>
            );
        }

        const topPostCreateAt = this.state.topPost ? this.state.topPost.create_at : 0;

        let postVisibility = this.props.postVisibility;

        // In focus mode there's an extra (Constants.POST_CHUNK_SIZE / 2) posts to show
        if (this.props.focusedPostId) {
            postVisibility += Constants.POST_CHUNK_SIZE / 2;
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
                    ref={this.postListRef}
                    className='post-list-holder-by-time'
                    key={'postlist-' + channel.id}
                    onScroll={this.handleScroll}
                >
                    <div className='post-list__table'>
                        <div
                            id='postListContent'
                            ref={this.postListContentRef}
                            className='post-list__content'
                        >
                            {topRow}
                            {this.createPosts(posts.slice(0, postVisibility))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
