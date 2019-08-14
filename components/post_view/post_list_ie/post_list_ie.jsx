// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {isCombinedUserActivityPost} from 'mattermost-redux/utils/post_list';
import {debounce} from 'mattermost-redux/actions/helpers';
import EventEmitter from 'mattermost-redux/utils/event_emitter';

import Constants, {PostTypes, EventTypes, PostRequestTypes} from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';

import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import {isFromWebhook} from 'utils/post_utils.jsx';

import LoadingScreen from 'components/loading_screen.jsx';
import DateSeparator from 'components/post_view/date_separator';
import FloatingTimestamp from 'components/post_view/floating_timestamp';
import NewMessagesBelow from 'components/post_view/new_messages_below';
import CombinedUserActivityPost from 'components/post_view/combined_user_activity_post';

import Post from 'components/post_view/post';
import ScrollToBottomArrows from 'components/post_view/scroll_to_bottom_arrows.jsx';
import CreateChannelIntroMessage from 'components/post_view/channel_intro_message';

const CLOSE_TO_BOTTOM_SCROLL_MARGIN = 10;
const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;
const MAX_EXTRA_PAGES_LOADED = 10;

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

        actions: PropTypes.shape({

            loadLatestPosts: PropTypes.func.isRequired,

            /**
             * Function to increase the number of posts being rendered
             */
            loadPosts: PropTypes.func.isRequired,

            /**
             * Function to check and set if app is in mobile view
             */
            checkAndSetMobileView: PropTypes.func.isRequired,

            /**
             * Function to load permalink posts
             */
            loadPostsAround: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        this.previousScrollTop = Number.MAX_SAFE_INTEGER;
        this.previousScrollHeight = 0;
        this.previousClientHeight = 0;
        this.atBottom = false;
        this.extraPagesLoaded = 0;
        this.loadingPosts = false;

        this.state = {
            atEnd: false,
            unViewedCount: 0,
            isDoingInitialLoad: true,
            isScrolling: false,
            lastViewed: props.lastViewedAt,
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        this.props.actions.checkAndSetMobileView();
        EventEmitter.addListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.handleResize);

        window.addEventListener('resize', this.handleWindowResize);

        this.initialScroll();
    }

    componentWillUnmount() {
        this.mounted = false;
        EventEmitter.removeListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.handleResize);
        window.removeEventListener('resize', this.handleWindowResize);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        // Focusing on a new post so load posts around it
        if (nextProps.focusedPostId && this.props.focusedPostId !== nextProps.focusedPostId) {
            this.hasScrolledToFocusedPost = false;
            this.hasScrolledToNewMessageSeparator = false;
            this.setState({atEnd: false, isDoingInitialLoad: !nextProps.posts});
            this.loadPosts(nextProps.channel.id, nextProps.focusedPostId);
            return;
        }

        const channel = this.props.channel || {};
        const nextChannel = nextProps.channel || {};

        if (nextProps.focusedPostId == null) {
            // Channel changed so load posts for new channel
            if (channel.id !== nextChannel.id) {
                this.hasScrolled = false;
                this.hasScrolledToFocusedPost = false;
                this.hasScrolledToNewMessageSeparator = false;
                this.atBottom = false;

                this.extraPagesLoaded = 0;

                this.setState({atEnd: false, lastViewed: nextProps.lastViewedAt, isDoingInitialLoad: !nextProps.posts, unViewedCount: 0});

                if (nextChannel.id) {
                    this.loadPosts(nextChannel.id);
                }
            }
        }
    }

    UNSAFE_componentWillUpdate() { // eslint-disable-line camelcase
        if (this.refs.postlist) {
            this.previousScrollTop = this.refs.postlist.scrollTop;
            this.previousScrollHeight = this.refs.postlist.scrollHeight;
            this.previousClientHeight = this.refs.postlist.clientHeight;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.focusedPostId && this.props.focusedPostId !== prevProps.focusedPostId) {
            this.hasScrolledToFocusedPost = false;
            this.hasScrolledToNewMessageSeparator = false;
            this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        } else if (this.props.channel && (!prevProps.channel || this.props.channel.id !== prevProps.channel.id)) {
            this.hasScrolled = false;
            this.hasScrolledToFocusedPost = false;
            this.hasScrolledToNewMessageSeparator = false;

            this.extraPagesLoaded = 0;

            this.setState({atEnd: false, isDoingInitialLoad: !this.props.posts, unViewedCount: 0}); // eslint-disable-line react/no-did-update-set-state

            this.loadPosts(this.props.channel.id);
        }

        this.loadPostsToFillScreenIfNecessary();

        // Do not update scrolling unless posts, visibility or intro message change
        if (this.props.posts === prevProps.posts && this.props.postVisibility === prevProps.postVisibility && this.state.atEnd === prevState.atEnd) {
            return;
        }

        const prevPosts = prevProps.posts || [];
        const posts = this.props.posts || [];

        if (this.props.focusedPostId == null) {
            const hasNewPosts = (prevPosts.length === 0 && posts.length > 0) || (prevPosts.length > 0 && posts.length > 0 && prevPosts[0].id !== posts[0].id);

            if (!this.checkBottom() && hasNewPosts) {
                this.setUnreadsBelow(posts, this.props.currentUserId);
            }
        }

        const postList = this.refs.postlist;
        if (!postList) {
            return;
        }

        // Scroll to focused post on first load
        const focusedPost = this.refs[this.props.focusedPostId];
        if (focusedPost && this.props.posts) {
            if (!this.hasScrolledToFocusedPost) {
                const element = ReactDOM.findDOMNode(focusedPost);
                const rect = element.getBoundingClientRect();
                const listHeight = postList.clientHeight / 2;
                postList.scrollTop += rect.top - listHeight;
                this.atBottom = this.checkBottom();
            } else if (this.previousScrollHeight !== postList.scrollHeight && posts[0].id === prevPosts[0].id) {
                postList.scrollTop = this.previousScrollTop + (postList.scrollHeight - this.previousScrollHeight);
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
            if (postId !== prevPostId && pendingPostId !== prevPostId) {
                // If already scrolled to bottom
                if (this.atBottom) {
                    doScrollToBottom = true;
                }

                // If new post was ephemeral
                if (Utils.isPostEphemeral(posts[0])) {
                    doScrollToBottom = true;
                }
            }

            if (doScrollToBottom) {
                this.atBottom = true;
                postList.scrollTop = postList.scrollHeight;
                return;
            }

            // New posts added at the top, maintain scroll position
            if (this.previousScrollHeight !== postList.scrollHeight && posts[0].id === prevPosts[0].id) {
                postList.scrollTop = this.previousScrollTop + (postList.scrollHeight - this.previousScrollHeight);
            }
        }
    }

    loadPostsToFillScreenIfNecessary = () => {
        if (this.props.focusedPostId) {
            return;
        }

        if (this.state.isDoingInitialLoad) {
            // Should already be loading posts
            return;
        }

        if (this.state.atEnd || !this.refs.postListContent || !this.refs.postlist) {
            // No posts to load
            return;
        }

        if (this.refs.postListContent.scrollHeight >= this.refs.postlist.clientHeight) {
            // Screen is full
            return;
        }

        if (this.extraPagesLoaded > MAX_EXTRA_PAGES_LOADED) {
            // Prevent this from loading a lot of pages in a channel with only hidden messages
            return;
        }

        this.doLoadPostsToFillScreen();
    };

    doLoadPostsToFillScreen = debounce(() => {
        this.extraPagesLoaded += 1;

        this.loadMorePosts();
    }, 100);

    // Scroll to new message indicator or bottom on first load. Returns true
    // if we just scrolled for the initial load.
    initialScroll = () => {
        if (this.hasScrolledToNewMessageSeparator) {
            // Already scrolled to new messages indicator
            return false;
        }

        const postList = this.refs.postlist;
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
        postList.scrollTop = postList.scrollHeight;
        this.atBottom = true;
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
        if (this.mounted) {
            this.setState({unViewedCount});
        }
    }

    handleScrollStop = () => {
        if (this.mounted) {
            this.setState({
                isScrolling: false,
            });
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

    handleWindowResize = () => {
        this.handleResize();
    }

    handleResize = (forceScrollToBottom) => {
        const postList = this.refs.postlist;
        const messageSeparator = this.refs.newMessageSeparator;
        const doScrollToBottom = this.atBottom || forceScrollToBottom;

        if (postList) {
            if (doScrollToBottom) {
                postList.scrollTop = postList.scrollHeight;
            } else if (!this.hasScrolled && messageSeparator) {
                const element = ReactDOM.findDOMNode(messageSeparator);
                element.scrollIntoView();
            }
            this.previousScrollHeight = postList.scrollHeight;
            this.previousScrollTop = postList.scrollTop;
            this.previousClientHeight = postList.clientHeight;

            this.atBottom = this.checkBottom();
        }

        this.props.actions.checkAndSetMobileView();
    }

    loadPosts = async (channelId, focusedPostId) => {
        if (!channelId) {
            return;
        }

        let posts;
        let atOldestmessage;
        if (focusedPostId) {
            ({atOldestmessage} = await this.props.actions.loadPostsAround(channelId, focusedPostId));
        } else {
            ({atOldestmessage} = await this.props.actions.loadLatestPosts(channelId));
        }

        if (this.mounted) {
            this.setState({
                isDoingInitialLoad: false,
                atEnd: atOldestmessage,
            });
        }

        if (focusedPostId) {
            this.hasScrolledToFocusedPost = true;
        } else {
            if (!this.checkBottom()) {
                const postsArray = posts.order.map((id) => posts.posts[id]);
                this.setUnreadsBelow(postsArray, this.props.currentUserId);
            }

            this.hasScrolledToNewMessageSeparator = true;
        }
    }

    loadMorePosts = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const {posts, channel} = this.props;
        const postsLength = posts.length;

        if (!posts) {
            return;
        }

        const {moreToLoad} = await this.props.actions.loadPosts({channelId: channel.id, postId: posts[postsLength - 1].id, type: PostRequestTypes.BEFORE_ID});
        this.setState({atEnd: !moreToLoad});
    }

    handleScroll = () => {
        // Only count as user scroll if we've already performed our first load scroll
        this.hasScrolled = this.hasScrolledToNewMessageSeparator || this.hasScrolledToFocusedPost;
        if (!this.refs.postlist) {
            return;
        }

        this.updateFloatingTimestamp();

        this.previousScrollTop = this.refs.postlist.scrollTop;

        if (this.refs.postlist.scrollHeight === this.previousScrollHeight) {
            this.atBottom = this.checkBottom();
        }

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

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
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

                if (!element || !domNode || domNode.offsetTop + domNode.clientHeight <= this.refs.postlist.scrollTop) {
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

    createPosts = (posts) => {
        const postCtls = [];
        let previousPostDay = new Date(0);
        let previousPostId = '';
        const currentUserId = this.props.currentUserId;
        const lastViewed = this.props.lastViewedAt || 0;

        let renderedLastViewed = false;

        for (let i = posts.length - 1; i >= 0; i--) {
            const post = posts[i];
            let postCtl;
            if (
                post == null ||
                post.type === PostTypes.EPHEMERAL_ADD_TO_CHANNEL
            ) {
                continue;
            }

            if (isCombinedUserActivityPost(post.id)) {
                postCtl = (
                    <CombinedUserActivityPost
                        combinedId={post.id}
                        previousPostId={previousPostId}
                    />
                );
            } else {
                postCtl = (
                    <Post
                        ref={post.id}
                        key={'post ' + (post.id || post.pending_post_id)}
                        post={post}
                        shouldHighlight={this.props.focusedPostId === post.id}
                        previousPostId={previousPostId}
                    />
                );
            }

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
            previousPostId = post.id;
        }

        return postCtls;
    }

    render() {
        const posts = this.props.posts || [];
        const channel = this.props.channel;

        if ((posts.length === 0 && this.state.isDoingInitialLoad) || channel == null) {
            return (
                <div
                    id='post-list'
                    className='a11y__region'
                    data-a11y-sort-order='1'
                    data-a11y-focus-child={true}
                    data-a11y-order-reversed={true}
                    data-a11y-loop-navigation={false}
                >
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
            <div
                id='post-list'
                className='a11y__region'
                data-a11y-sort-order='1'
                data-a11y-focus-child={true}
                data-a11y-order-reversed={true}
                data-a11y-loop-navigation={false}
            >
                <FloatingTimestamp
                    isScrolling={this.state.isScrolling}
                    isMobile={Utils.isMobile()}
                    createAt={topPostCreateAt}
                />
                <ScrollToBottomArrows
                    isScrolling={this.state.isScrolling}
                    atBottom={this.atBottom}
                    onClick={this.scrollToBottom}
                />
                {!this.props.focusedPostId && (
                    <NewMessagesBelow
                        atBottom={this.atBottom}
                        lastViewedBottom={this.state.lastViewed}
                        onClick={this.scrollToBottom}
                        channelId={this.props.channel.id}
                    />
                )}
                <div
                    ref='postlist'
                    className='post-list-holder-by-time normal_post_list'
                    key={'postlist-' + channel.id}
                    onScroll={this.handleScroll}
                >
                    <div className='post-list__table'>
                        <div
                            id='postListContent'
                            ref='postListContent'
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
