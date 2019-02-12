// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'react-window';

import Constants from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import * as Utils from 'utils/utils.jsx';
import {getClosestValidPostIndex} from 'utils/post_utils.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import FloatingTimestamp from './floating_timestamp.jsx';
import PostListRow from './post_list_row';
import ScrollToBottomArrows from './scroll_to_bottom_arrows.jsx';

if (typeof ResizeObserver === 'undefined') {
    global.ResizeObserver = require('resize-observer-polyfill').default; //eslint-disable-line
}

const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;
const MAX_NUMBER_OF_AUTO_RETRIES = 3;

// const MAX_EXTRA_PAGES_LOADED = 10;
// const LOADPOSTS_MIN_HEIGHT = 300;
// const LOADPOSTS_MAX_HEIGHT = 2500;
// const LOADPOSTS_SCROLL_RATIO = 0.3;

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         * Array of posts in the channel, ordered from oldest to newest
         */
        posts: PropTypes.array,

        postListIds: PropTypes.array,

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

        this.state = {
            atEnd: false,
            isDoingInitialLoad: true,
            isScrolling: false,
            lastViewed: props.lastViewedAt,
            autoRetryEnable: true,
            isMobile: Utils.isMobile(),
            atBottom: true,
        };

        this.listRef = React.createRef();
        this.scrollStopAction = new DelayedAction(this.handleScrollStop);
    }

    componentDidMount() {
        this.mounted = true;
        this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        this.props.actions.checkAndSetMobileView();

        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', this.handleWindowResize);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.postListIds) {
            let postListIds;
            if (state.atEnd) {
                postListIds = [...props.postListIds, 'CHANNEL_INTRO_MESSAGE'];
            } else if (props.postVisibility >= Constants.MAX_POST_VISIBILITY) {
                postListIds = [...props.postListIds, 'MAX_MESSAGES_LOADED'];
            } else if (state.autoRetryEnable) {
                postListIds = [...props.postListIds, 'MORE_MESSAGES_LOADER'];
            } else {
                postListIds = [...props.postListIds, 'MANUAL_TRIGGER_LOAD_MESSAGES'];
            }
            return {
                postListIds,
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
            this.setState({
                isDoingInitialLoad: false,
                atEnd: Boolean(posts && posts.order.length < POSTS_PER_PAGE),
            });
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
            if (this.mounted) {
                this.setState({
                    atEnd: !moreToLoad && this.props.posts.length < this.props.postVisibility,
                    autoRetryEnable: true,
                });
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
                />
            </div>
        );
    };

    itemKey = (index) => {
        const {postListIds} = this.state;
        return postListIds[index] ? postListIds[index] : index;
    }

    onScroll = ({scrollDirection, scrollOffset, scrollUpdateWasRequested}) => {
        if (scrollDirection === 'backward' && scrollOffset < 200 && !this.loadingPosts && !scrollUpdateWasRequested && !this.state.atEnd && !this.state.isDoingInitialLoad) {
            this.loadingPosts = true;
            this.loadMorePosts();
        }

        if (this.state.isMobile && !this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            });
            this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
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

    initItemsLoad = (scrollToItem) => {
        if (this.props.focusedPostId) {
            const index = this.state.postListIds.findIndex(
                (item) => item === this.props.focusedPostId
            );

            // Dirty fix ideally this should have been called with the method available on the ref
            // Due to some race condition ref does not have the method when this gets called
            scrollToItem(index, 'center');
        } else {
            scrollToItem(0, 'end');
        }
    }

    scrollToBottom = () => {
        this.listRef.current.scrollToItem(0, 'end');
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
                                        overscanCount={60}
                                        onScroll={this.onScroll}
                                        onItemsRendered={this.onItemsRendered}
                                        initItemsLoad={this.initItemsLoad}
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
