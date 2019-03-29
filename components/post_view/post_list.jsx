// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'react-window';

import Constants, {PostListRowListIds} from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import * as Utils from 'utils/utils.jsx';
import {getClosestValidPostIndex} from 'utils/post_utils.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import NewMessageIndicator from './new_message_indicator.jsx';
import FloatingTimestamp from './floating_timestamp.jsx';
import PostListRow from './post_list_row';
import ScrollToBottomArrows from './scroll_to_bottom_arrows.jsx';

const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;
const MAX_NUMBER_OF_AUTO_RETRIES = 3;

const MAX_EXTRA_PAGES_LOADED = 10;

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         * Array of posts in the channel, ordered from oldest to newest
         */
        posts: PropTypes.array,

        /**
         * Array of Ids in the channel including date separators, new message indicator, more messages loader,
         * manual load messages trigger and postId in the order of newest to oldest for populating virtual list rows
         */
        postListIds: PropTypes.array,

        /**
         * Object of posts with post.id as key. This is used for passing down post as we need extra metadata made in
         * getPostsAroundPost and getPostsInChannel. The metadata includes `consecutivePostByUser`, `isFirstReply` etc
         */
        postsObjById: PropTypes.object,

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
         * When switching teams we might end up in a state where we select channel from previous team
         * This flag is explicitly added for adding a loader in these cases to not mounting post list
         */
        channelLoading: PropTypes.bool,

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

        this.loadingPosts = false;
        this.extraPagesLoaded = 0;

        const channelIntroMessage = PostListRowListIds.CHANNEL_INTRO_MESSAGE;
        const isMobile = Utils.isMobile();
        this.state = {
            atEnd: false,
            postsLoading: !props.posts || props.channelLoading,
            isScrolling: false,
            lastViewed: props.lastViewedAt,
            autoRetryEnable: true,
            isMobile,
            atBottom: true,
            unViewedCount: 0,
            postListIds: [channelIntroMessage],
            postsObjById: {channelIntroMessage},
            floatingTimestampDate: 0,
        };

        this.listRef = React.createRef();
        if (isMobile) {
            this.scrollStopAction = new DelayedAction(this.handleScrollStop);
        }
    }

    componentDidMount() {
        this.mounted = true;
        if (!this.props.channelLoading) {
            this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        }
        this.props.actions.checkAndSetMobileView();

        window.addEventListener('resize', this.handleWindowResize);
    }

    componentDidUpdate(prevProps) {
        const prevPosts = prevProps.posts;
        const {posts} = this.props;
        if (prevPosts && posts && prevPosts.length && posts.length) {
            const presentLastPost = posts[0];
            const previousLastPost = prevPosts[0];
            const isNewPostByCurrentUser = previousLastPost.id !== presentLastPost.id && presentLastPost.id === presentLastPost.pending_post_id;
            const isNewPostNotReply = !presentLastPost.parent_id;
            if (isNewPostByCurrentUser && isNewPostNotReply) {
                this.scrollToBottom();
            }
            const hasNewPosts = prevPosts.length > 0 && posts.length > 0 && previousLastPost.id !== presentLastPost.id;
            if (!this.state.atBottom && hasNewPosts) {
                this.setUnreadsBelow(posts, this.props.currentUserId);
            }
        }

        if (prevProps.channelLoading && !this.props.channelLoading) {
            this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', this.handleWindowResize);
    }

    static getDerivedStateFromProps(props, state) {
        const {postListIds} = props;
        if (postListIds) {
            let newPostListIds;
            if (state.atEnd) {
                return {
                    postListIds: [...props.postListIds, PostListRowListIds.CHANNEL_INTRO_MESSAGE],
                };
            }
            if (props.postVisibility >= Constants.MAX_POST_VISIBILITY) {
                newPostListIds = [...postListIds, PostListRowListIds.MAX_MESSAGES_LOADED];
            } else if (state.autoRetryEnable) {
                newPostListIds = [...postListIds, PostListRowListIds.MORE_MESSAGES_LOADER];
            } else {
                newPostListIds = [...postListIds, PostListRowListIds.MANUAL_TRIGGER_LOAD_MESSAGES];
            }
            return {
                postListIds: newPostListIds,
            };
        }
        return null;
    }

    handleWindowResize = () => {
        this.props.actions.checkAndSetMobileView();
        if (Utils.isMobile() !== this.state.isMobile) {
            this.setState({
                isMobile: true,
            });
            this.scrollStopAction = new DelayedAction(this.handleScrollStop);
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
        if (this.mounted) {
            this.setState({unViewedCount});
        }
    }

    loadPosts = async (channelId, focusedPostId) => {
        if (!channelId) {
            return;
        }

        let posts;
        if (focusedPostId) {
            const getPostThreadAsync = this.props.actions.getPostThread(focusedPostId, false);
            const getPostsBeforeAsync = this.props.actions.getPostsBefore(channelId, focusedPostId, 0, POSTS_PER_PAGE);
            const getPostsAfterAsync = this.props.actions.getPostsAfter(channelId, focusedPostId, 0, POSTS_PER_PAGE);

            const result = await getPostsBeforeAsync;
            posts = result.data;
            await getPostsAfterAsync;
            await getPostThreadAsync;
        } else {
            const result = await this.props.actions.getPosts(channelId, 0, POSTS_PER_PAGE);
            posts = result.data;
        }

        if (this.mounted) {
            const atEnd = Boolean(posts && posts.order.length < POSTS_PER_PAGE);
            const newState = {
                postsLoading: false,
                atEnd,
            };

            this.setState(newState);
        }
    }

    loadMorePosts = async () => {
        const {moreToLoad, error} = await this.props.actions.increasePostVisibility(this.props.channel.id, this.props.focusedPostId);
        if (error) {
            if (this.autoRetriesCount < MAX_NUMBER_OF_AUTO_RETRIES) {
                this.autoRetriesCount++;
                this.loadMorePosts();
            } else if (this.mounted) {
                this.setState({autoRetryEnable: false});
            }
        } else {
            this.loadingPosts = false;
            if (this.mounted && this.props.posts) {
                const atEnd = !moreToLoad && this.props.posts.length < this.props.postVisibility;
                const newState = {
                    atEnd,
                    autoRetryEnable: true,
                };

                this.setState(newState);
            }
            if (!this.state.autoRetryEnable) {
                this.autoRetriesCount = 0;
            }
        }
    }

    renderRow = ({itemId, style}) => {
        return (
            <div style={style}>
                <PostListRow
                    listId={itemId}
                    channel={this.props.channel}
                    shouldHighlight={itemId === this.props.focusedPostId}
                    post={this.props.postsObjById[itemId]}
                    loadMorePosts={this.loadMorePosts}
                />
            </div>
        );
    };

    itemKey = (index) => {
        const {postListIds} = this.state;
        return postListIds[index] ? postListIds[index] : index;
    }

    onScroll = ({scrollDirection, scrollOffset, scrollUpdateWasRequested}) => {
        const isNotLoadingPosts = !this.state.postsLoading && !this.loadingPosts;
        const didUserScrollBackwards = scrollDirection === 'backward' && !scrollUpdateWasRequested;
        const isOffsetWithInRange = scrollOffset < 1000;
        if (isNotLoadingPosts && didUserScrollBackwards && isOffsetWithInRange && !this.state.atEnd) {
            this.loadingPosts = true;
            this.loadMorePosts();
        }

        if (this.state.isMobile) {
            if (!this.state.isScrolling) {
                this.setState({
                    isScrolling: true,
                });
            }
            if (this.scrollStopAction) {
                this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
            }
        }
    }

    handleScrollStop = () => {
        if (this.mounted) {
            this.setState({
                isScrolling: false,
            });
        }
    }

    updateFloatingTimestamp = (visibleTopItem) => {
        if (!this.state.isMobile) {
            return;
        }
        if (this.props.posts) {
            const postIndex = getClosestValidPostIndex(this.state.postListIds, visibleTopItem);
            const postId = this.state.postListIds[postIndex];
            const topPostInView = this.props.posts.find((post) => post.id === postId);
            const floatingTimestampDate = topPostInView ? Utils.getDateForUnixTicks(topPostInView.create_at) : 0;
            if (floatingTimestampDate !== this.state.floatingTimestampDate) {
                this.setState({
                    floatingTimestampDate,
                });
            }
        }
    }

    checkBottom = (visibleStartIndex) => {
        if (visibleStartIndex === 0) {
            if (!this.state.atBottom) {
                this.setState({
                    atBottom: true,
                    lastViewed: new Date().getTime(),
                    unViewedCount: 0,
                });
            }
        } else if (this.state.atBottom) {
            this.setState({
                atBottom: false,
            });
        }
    }

    onItemsRendered = ({
        visibleStartIndex,
        visibleStopIndex,
    }) => {
        this.updateFloatingTimestamp(visibleStopIndex);
        this.checkBottom(visibleStartIndex);
    }

    initScrollToIndex = () => {
        if (this.props.focusedPostId) {
            const index = this.state.postListIds.findIndex(
                (item) => item === this.props.focusedPostId
            );
            return {
                index,
                position: 'center',
            };
        }
        const newMessagesSeparatorIndex = this.state.postListIds.findIndex(
            (item) => item.indexOf(PostListRowListIds.START_OF_NEW_MESSAGES) === 0
        );
        if (newMessagesSeparatorIndex > 0) {
            return {
                index: newMessagesSeparatorIndex,
                position: 'start',
            };
        }
        return {
            index: 0,
            position: 'end',
        };
    }

    scrollToBottom = () => {
        this.listRef.current.scrollToItem(0, 'end');
    }

    canLoadMorePosts = async () => {
        if (this.props.focusedPostId) {
            return;
        }

        if (this.state.postsLoading || this.loadingPosts) {
            // Should already be loading posts
            return;
        }

        if (this.state.atEnd) {
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
    }

    render() {
        const channel = this.props.channel;

        if (this.state.postsLoading || channel == null) {
            return (
                <div id='post-list'>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        }

        return (
            <div id='post-list'>
                {this.state.isMobile && (
                    <React.Fragment>
                        <FloatingTimestamp
                            isScrolling={this.state.isScrolling}
                            isMobile={true}
                            createAt={this.state.floatingTimestampDate}
                        />
                        <ScrollToBottomArrows
                            isScrolling={this.state.isScrolling}
                            atBottom={this.state.atBottom}
                            onClick={this.scrollToBottom}
                        />
                    </React.Fragment>
                )}
                <NewMessageIndicator
                    newMessages={this.state.unViewedCount}
                    onClick={this.scrollToBottom}
                />
                <div
                    className='post-list-holder-by-time'
                    key={'postlist-' + channel.id}
                >
                    <div className='post-list__table'>
                        <div
                            id='postListContent'
                            className='post-list__content'
                        >
                            <AutoSizer>
                                {({height, width}) => (
                                    <DynamicSizeList
                                        ref={this.listRef}
                                        height={height}
                                        width={width}
                                        itemCount={this.state.postListIds.length}
                                        itemData={this.state.postListIds}
                                        itemKey={this.itemKey}
                                        overscanCount={100}
                                        onScroll={this.onScroll}
                                        onItemsRendered={this.onItemsRendered}
                                        initScrollToIndex={this.initScrollToIndex}
                                        onNewItemsMounted={this.onNewItemsMounted}
                                        canLoadMorePosts={this.canLoadMorePosts}
                                    >
                                        {this.renderRow}
                                    </DynamicSizeList>
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
