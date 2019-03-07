// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';
import * as PostListUtils from 'mattermost-redux/utils/post_list';

import Constants from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import EventTypes from 'utils/event_types.jsx';
import GlobalEventEmitter from 'utils/global_event_emitter.jsx';
import * as Utils from 'utils/utils.jsx';

import LoadingScreen from 'components/loading_screen.jsx';
import DateSeparator from 'components/post_view/date_separator';
import FloatingTimestamp from 'components/post_view/floating_timestamp';

import CombinedUserActivityPost from './combined_user_activity_post';
import NewMessagesBelow from './new_messages_below';
import Post from './post';
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
         * Array of post IDs in the channel, ordered from oldest to newest
         */
        postIds: PropTypes.array,

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
         * Set to focus this post
         */
        focusedPostId: PropTypes.string,

        /**
         * Whether to display the channel intro at full width
         */
        fullWidth: PropTypes.bool,

        actions: PropTypes.shape({

            loadInitialPosts: PropTypes.func.isRequired,

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
        this.loadingPosts = false;

        this.state = {
            atEnd: false,
            isDoingInitialLoad: true,
            isScrolling: false,
            lastViewed: props.lastViewedAt,
            autoRetryEnable: true,
            topPostId: '',
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        this.props.actions.checkAndSetMobileView();
        GlobalEventEmitter.addListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.handleResize);

        window.addEventListener('resize', this.handleWindowResize);

        this.initialScroll();
    }

    componentWillUnmount() {
        this.mounted = false;
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

            this.setState({atEnd: false, isDoingInitialLoad: !this.props.postIds}); // eslint-disable-line react/no-did-update-set-state

            this.loadPosts(this.props.channel.id);
        }

        this.loadPostsToFillScreenIfNecessary();

        // Do not update scrolling unless posts, visibility or intro message change
        if (this.props.postIds === prevProps.postIds && this.props.postVisibility === prevProps.postVisibility && this.state.atEnd === prevState.atEnd) {
            return;
        }

        const prevPostIds = prevProps.postIds || [];
        const postIds = this.props.postIds || [];

        const postList = this.postListRef.current;
        if (!postList) {
            return;
        }
        const postlistScrollHeight = postList.scrollHeight;

        // Scroll to focused post on first load
        const focusedPost = this.refs[this.props.focusedPostId];
        if (focusedPost && this.props.postIds) {
            if (!this.hasScrolledToFocusedPost) {
                const element = ReactDOM.findDOMNode(focusedPost);
                const rect = element.getBoundingClientRect();
                const listHeight = postList.clientHeight / 2;
                postList.scrollTop = (rect.top - listHeight) + postList.scrollTop;
                this.atBottom = this.checkBottom();
            } else if (snapshot && snapshot.previousScrollHeight !== postlistScrollHeight && postIds[0] === prevPostIds[0]) {
                postList.scrollTop = snapshot.previousScrollTop + (postlistScrollHeight - snapshot.previousScrollHeight);
            }
            return;
        }

        const didInitialScroll = this.initialScroll();

        if (postIds.length >= Posts.POST_CHUNK_SIZE) {
            this.hasScrolledToNewMessageSeparator = true;
        }

        if (didInitialScroll) {
            return;
        }

        if (postList && prevPostIds && postIds) {
            // A new message was posted, so scroll to bottom if user
            // was already scrolled close to bottom
            if (snapshot && snapshot.wasAtBottom && postIds[0] !== prevPostIds[0]) {
                this.atBottom = true;
                postList.scrollTop = postlistScrollHeight;
                return;
            }

            // New posts added at the top, maintain scroll position
            if (snapshot && snapshot.previousScrollHeight !== postlistScrollHeight && postIds[0] === prevPostIds[0]) {
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

        if (this.state.isDoingInitialLoad || this.loadingPosts) {
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
        const postIds = this.props.postIds;
        if (!postList || !postIds) {
            // Not able to do initial scroll yet
            return false;
        }

        const messageSeparator = this.refs.newMessageSeparator;

        // Scroll to new message indicator since we have unread posts and we can't show every new post in the screen
        if (messageSeparator && (postList.scrollHeight - messageSeparator.offsetTop) > postList.clientHeight) {
            messageSeparator.scrollIntoView();
            return true;
        }

        // Scroll to bottom since we don't have unread posts or we can show every new post in the screen
        this.atBottom = true;
        postList.scrollTop = postList.scrollHeight;
        return true;
    }

    handleScrollStop = () => {
        if (this.mounted) {
            this.setState({
                isScrolling: false,
            });
        }
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
        if (!channelId) {
            return;
        }

        const {hasMoreBefore} = await this.props.actions.loadInitialPosts(channelId, focusedPostId);

        if (focusedPostId) {
            this.hasScrolledToFocusedPost = true;
        } else {
            this.hasScrolledToNewMessageSeparator = true;
        }

        if (this.mounted) {
            this.setState({
                isDoingInitialLoad: false,
                atEnd: !hasMoreBefore,
            });
        }
    }

    loadMorePosts = async () => {
        const oldestPostId = this.getOldestVisiblePostId();

        if (!oldestPostId) {
            // loadMorePosts shouldn't be called if we don't already have posts
            return;
        }

        const {moreToLoad, error} = await this.props.actions.increasePostVisibility(this.props.channel.id, oldestPostId);
        if (error) {
            if (this.autoRetriesCount < MAX_NUMBER_OF_AUTO_RETRIES) {
                this.autoRetriesCount++;
                this.loadMorePosts();
            } else if (this.mounted) {
                this.setState({autoRetryEnable: false});
            }
        } else {
            this.loadingPosts = false;
            if (this.mounted) {
                this.setState({
                    atEnd: !moreToLoad,
                    autoRetryEnable: true,
                });
            }
            if (!this.state.autoRetryEnable) {
                this.autoRetriesCount = 0;
            }
        }
    }

    getOldestVisiblePostId = () => {
        return PostListUtils.getLastPostId(this.props.postIds.slice(0, this.props.postVisibility));
    }

    handleScroll = () => {
        if (this.scrollAnimationFrame) {
            window.cancelAnimationFrame(this.scrollAnimationFrame);
        }

        this.scrollAnimationFrame = window.requestAnimationFrame(() => {
            // Only count as user scroll if we've already performed our first load scroll
            this.hasScrolled = this.hasScrolledToNewMessageSeparator || this.hasScrolledToFocusedPost;
            const postList = this.postListRef.current;
            const postListScrollTop = postList.scrollTop;

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
                    isScrolling: false,
                });
            }

            let shouldLoadPosts = false;
            const scrollHeightAoveFoldForLoad = LOADPOSTS_SCROLL_RATIO * (postList.scrollHeight - postList.clientHeight);

            if (postListScrollTop < LOADPOSTS_MIN_HEIGHT) {
                shouldLoadPosts = true;
            } else if ((postListScrollTop < LOADPOSTS_MAX_HEIGHT) && (postListScrollTop < scrollHeightAoveFoldForLoad)) {
                shouldLoadPosts = true;
            }

            if (shouldLoadPosts && !this.loadingPosts && !this.state.atEnd && this.state.autoRetryEnable) {
                this.loadingPosts = true;
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

        if (this.props.postIds) {
            for (let i = this.props.postIds.length - 1; i >= 0; i--) {
                const postId = this.props.postIds[i];

                if (PostListUtils.isStartOfNewMessages(postId) || PostListUtils.isDateLine(postId)) {
                    // This is a date separator or the new messages line
                    continue;
                }

                const element = this.refs[postId];
                const domNode = ReactDOM.findDOMNode(element);

                if (domNode && domNode.offsetTop + domNode.clientHeight > this.postListRef.current.scrollTop) {
                    const topPostId = postId;

                    if (topPostId !== this.state.topPostId) {
                        this.setState({
                            topPostId,
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

    renderItem = (item, index) => {
        if (PostListUtils.isStartOfNewMessages(item)) {
            return (
                <div
                    key='unviewed'
                    ref='newMessageSeparator'
                    className='new-separator'
                >
                    <hr className='separator__hr'/>
                    <div className='separator__text'>
                        <FormattedMessage
                            id='posts_view.newMsg'
                            defaultMessage='New Messages'
                        />
                    </div>
                </div>
            );
        }

        if (PostListUtils.isDateLine(item)) {
            const date = PostListUtils.getDateForDateLine(item);

            return (
                <DateSeparator
                    key={date}
                    date={date}
                />
            );
        }

        const postId = item;
        const previousPostId = index < this.props.postIds.length - 1 ? this.props.postIds[index + 1] : '';

        const postProps = {
            previousPostId,
            getPostList: this.getPostList,
            highlight: postId === this.props.focusedPostId,
            key: 'post ' + postId,
            ref: postId,
        };

        if (PostListUtils.isCombinedUserActivityPost(item)) {
            return (
                <CombinedUserActivityPost
                    combinedId={item}
                    {...postProps}
                />
            );
        }

        return (
            <Post
                postId={item}
                {...postProps}
            />
        );
    }

    getPostList = () => {
        return this.postListRef.current;
    }

    render() {
        const postIds = this.props.postIds || [];
        const channel = this.props.channel;

        if (postIds.length === 0 && this.state.isDoingInitialLoad) {
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

        let postVisibility = this.props.postVisibility;

        // In focus mode there's an extra (Constants.POST_CHUNK_SIZE / 2) posts to show
        if (this.props.focusedPostId) {
            postVisibility += Constants.POST_CHUNK_SIZE / 2;
        }

        const atBottom = this.checkBottom();

        let newMessagesBelow = null;
        if (!this.props.focusedPostId) {
            newMessagesBelow = (
                <NewMessagesBelow
                    atBottom={atBottom}
                    lastViewedBottom={this.state.lastViewed}
                    postIds={this.props.postIds}
                    onClick={this.scrollToBottom}
                />
            );
        }

        return (
            <div id='post-list'>
                <FloatingTimestamp
                    isScrolling={this.state.isScrolling}
                    isMobile={Utils.isMobile()}
                    postId={this.state.topPostId}
                />
                <ScrollToBottomArrows
                    isScrolling={this.state.isScrolling}
                    atBottom={atBottom}
                    onClick={this.scrollToBottom}
                />
                {newMessagesBelow}
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
                            {postIds.slice(0, postVisibility).map(this.renderItem).reverse()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
