// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'react-window';

import {debounce} from 'mattermost-redux/actions/helpers';
import EventEmitter from 'mattermost-redux/utils/event_emitter';

import LoadingScreen from 'components/loading_screen.jsx';

import Constants, {PostListRowListIds} from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import {getLastPostId} from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import FloatingTimestamp from './floating_timestamp';
import NewMessagesBelow from './new_messages_below';
import PostListRow from './post_list_row';
import ScrollToBottomArrows from './scroll_to_bottom_arrows';

const MAX_NUMBER_OF_AUTO_RETRIES = 3;

const MAX_EXTRA_PAGES_LOADED = 10;
const OVERSCAN_COUNT_BACKWARD = window.OVERSCAN_COUNT_BACKWARD || 50; // Exposing the value for PM to test will be removed soon
const OVERSCAN_COUNT_FORWARD = window.OVERSCAN_COUNT_FORWARD || 100; // Exposing the value for PM to test will be removed soon
const HEIGHT_TRIGGER_FOR_MORE_POSTS = window.HEIGHT_TRIGGER_FOR_MORE_POSTS || 1000; // Exposing the value for PM to test will be removed soon

const postListHeightChangeForPadding = 21;

const postListStyle = {
    padding: '14px 0px 7px', //21px of height difference from autosized list compared to DynamicSizeList. If this is changed change the above variable postListHeightChangeForPadding accordingly
};

const virtListStyles = {
    position: 'absolute',
    bottom: '0',
    maxHeight: '100%',
};

export default class PostList extends React.PureComponent {
    static propTypes = {

        /**
         * Array of Ids in the channel including date separators, new message indicator, more messages loader,
         * manual load messages trigger and postId in the order of newest to oldest for populating virtual list rows
         */
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
         * Set to focus this post
         */
        focusedPostId: PropTypes.string,

        /**
         * When switching teams we might end up in a state where we select channel from previous team
         * This flag is explicitly added for adding a loader in these cases to not mounting post list
         */
        channelLoading: PropTypes.bool,

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

        this.loadingMorePosts = false;
        this.extraPagesLoaded = 0;

        const channelIntroMessage = PostListRowListIds.CHANNEL_INTRO_MESSAGE;
        const isMobile = Utils.isMobile();
        this.state = {
            atEnd: false,
            loadingFirstSetOfPosts: Boolean(!props.postListIds || props.channelLoading),
            isScrolling: false,
            autoRetryEnable: true,
            isMobile,
            atBottom: true,
            lastViewedBottom: Date.now(),
            postListIds: [channelIntroMessage],
            topPostId: '',
            postMenuOpened: false,
            dynamicListStyle: {
                willChange: 'transform',
            },
        };

        this.listRef = React.createRef();
        this.postListRef = React.createRef();
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

        EventEmitter.addListener('scroll_post_list_to_bottom', this.scrollToBottom);
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (this.postListRef && this.postListRef.current) {
            const postsAddedAtTop = this.state.postListIds.length !== prevState.postListIds.length && this.state.postListIds[0] === prevState.postListIds[0];
            const channelHeaderAdded = this.state.atEnd !== prevState.atEnd && this.state.postListIds.length === prevState.postListIds.length;
            if (postsAddedAtTop || channelHeaderAdded) {
                const previousScrollTop = this.postListRef.current.scrollTop;
                const previousScrollHeight = this.postListRef.current.scrollHeight;

                return {
                    previousScrollTop,
                    previousScrollHeight,
                };
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.channelLoading && !this.props.channelLoading) {
            this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        }

        if (!this.postListRef.current || !snapshot) {
            return;
        }

        const postlistScrollHeight = this.postListRef.current.scrollHeight;
        const postsAddedAtTop = this.state.postListIds.length !== prevState.postListIds.length && this.state.postListIds[0] === prevState.postListIds[0];
        const channelHeaderAdded = this.state.atEnd !== prevState.atEnd && this.state.postListIds.length === prevState.postListIds.length;
        if (postsAddedAtTop || channelHeaderAdded) {
            const scrollValue = snapshot.previousScrollTop + (postlistScrollHeight - snapshot.previousScrollHeight);
            if (scrollValue !== 0 && (scrollValue - snapshot.previousScrollTop) !== 0) {
                this.listRef.current.scrollTo(scrollValue, scrollValue - snapshot.previousScrollTop, !this.state.atEnd);
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', this.handleWindowResize);

        EventEmitter.removeListener('scroll_post_list_to_bottom', this.scrollToBottom);
    }

    static getDerivedStateFromProps(props, state) {
        const postListIds = props.postListIds || [];
        let newPostListIds;

        if (state.atEnd) {
            newPostListIds = [...postListIds, PostListRowListIds.CHANNEL_INTRO_MESSAGE];
        } else if (props.postVisibility >= Constants.MAX_POST_VISIBILITY) {
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

    handleWindowResize = () => {
        this.props.actions.checkAndSetMobileView();
        const isMobile = Utils.isMobile();
        if (isMobile !== this.state.isMobile) {
            const dynamicListStyle = this.state.dynamicListStyle;
            if (this.state.postMenuOpened) {
                if (!isMobile && dynamicListStyle.willChange === 'unset') {
                    dynamicListStyle.willChange = 'transform';
                } else if (isMobile && dynamicListStyle.willChange === 'transform') {
                    dynamicListStyle.willChange = 'unset';
                }
            }

            this.setState({
                isMobile,
                dynamicListStyle,
            });
            this.scrollStopAction = new DelayedAction(this.handleScrollStop);
        }
    }

    loadPosts = async (channelId, focusedPostId) => {
        if (!channelId) {
            return;
        }

        const {hasMoreBefore} = await this.props.actions.loadInitialPosts(channelId, focusedPostId);

        if (this.mounted) {
            this.setState({
                loadingFirstSetOfPosts: false,
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

        this.loadingMorePosts = true;

        const {moreToLoad, error} = await this.props.actions.increasePostVisibility(this.props.channel.id, oldestPostId);
        if (error) {
            if (this.autoRetriesCount < MAX_NUMBER_OF_AUTO_RETRIES) {
                this.autoRetriesCount++;
                debounce(this.loadMorePosts());
            } else if (this.mounted) {
                this.setState({autoRetryEnable: false});
            }
        } else {
            this.loadingMorePosts = false;

            if (this.mounted && this.props.postListIds) {
                this.setState({
                    atEnd: !moreToLoad,
                    autoRetryEnable: true,
                });
            }

            if (!this.state.autoRetryEnable) {
                this.autoRetriesCount = 0;
            }
        }
    };

    getOldestVisiblePostId = () => {
        return getLastPostId(this.state.postListIds);
    }

    togglePostMenu = (opened) => {
        const dynamicListStyle = this.state.dynamicListStyle;
        if (this.state.isMobile) {
            dynamicListStyle.willChange = opened ? 'unset' : 'transform';
        }

        this.setState({
            postMenuOpened: opened,
            dynamicListStyle,
        });
    };

    renderRow = ({data, itemId, style}) => {
        const index = data.indexOf(itemId);
        const previousItemId = (index !== -1 && index < data.length - 1) ? data[index + 1] : '';

        return (
            <div style={style}>
                <PostListRow
                    listId={itemId}
                    previousListId={previousItemId}
                    channel={this.props.channel}
                    shouldHighlight={itemId === this.props.focusedPostId}
                    loadMorePosts={this.loadMorePosts}
                    togglePostMenu={this.togglePostMenu}
                />
            </div>
        );
    };

    itemKey = (index) => {
        const {postListIds} = this.state;
        return postListIds[index] ? postListIds[index] : index;
    }

    onScroll = ({scrollDirection, scrollOffset, scrollUpdateWasRequested}) => {
        const isNotLoadingPosts = !this.state.loadingFirstSetOfPosts && !this.loadingMorePosts;
        const didUserScrollBackwards = scrollDirection === 'backward' && !scrollUpdateWasRequested;
        const isOffsetWithInRange = scrollOffset < HEIGHT_TRIGGER_FOR_MORE_POSTS;
        if (isNotLoadingPosts && didUserScrollBackwards && isOffsetWithInRange && !this.state.atEnd) {
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

        this.checkBottom(scrollOffset);
    }

    checkBottom = (scrollOffset) => {
        this.updateAtBottom(this.isAtBottom(scrollOffset));
    }

    isAtBottom = (scrollOffset) => {
        // Calculate how far the post list is from being scrolled to the bottom
        const postList = this.postListRef.current;
        const offsetFromBottom = (postList.scrollHeight - postList.parentElement.clientHeight) - scrollOffset;

        return offsetFromBottom === 0;
    }

    updateAtBottom = (atBottom) => {
        if (atBottom !== this.state.atBottom) {
            // Update lastViewedBottom when the list reaches or leaves the bottom
            this.setState({
                atBottom,
                lastViewedBottom: Date.now(),
            });
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

        if (!this.props.postListIds) {
            return;
        }

        this.setState({
            topPostId: getLastPostId(this.props.postListIds.slice(visibleTopItem)),
        });
    }

    onItemsRendered = ({visibleStartIndex}) => {
        this.updateFloatingTimestamp(visibleStartIndex);
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
            const topMostPostIndex = this.state.postListIds.indexOf(getLastPostId(this.state.postListIds));
            if (newMessagesSeparatorIndex === topMostPostIndex + 1) {
                this.loadMorePosts();
                return {
                    index: this.state.postListIds.length - 1,
                    position: 'start',
                };
            }
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

        if (this.state.loadingFirstSetOfPosts || this.loadingMorePosts) {
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

        if (this.state.loadingFirstSetOfPosts) {
            return (
                <div id='post-list'>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        }

        const {dynamicListStyle} = this.state;

        let newMessagesBelow = null;
        if (!this.props.focusedPostId) {
            newMessagesBelow = (
                <NewMessagesBelow
                    atBottom={this.state.atBottom}
                    lastViewedBottom={this.state.lastViewedBottom}
                    postIds={this.state.postListIds}
                    onClick={this.scrollToBottom}
                />
            );
        }

        return (
            <div id='post-list'>
                {this.state.isMobile && (
                    <React.Fragment>
                        <FloatingTimestamp
                            isScrolling={this.state.isScrolling}
                            isMobile={true}
                            postId={this.state.topPostId}
                        />
                        <ScrollToBottomArrows
                            isScrolling={this.state.isScrolling}
                            atBottom={this.state.atBottom}
                            onClick={this.scrollToBottom}
                        />
                    </React.Fragment>
                )}
                {newMessagesBelow}
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
                                        height={height - postListHeightChangeForPadding}
                                        width={width}
                                        className='post-list__dynamic'
                                        itemCount={this.state.postListIds.length}
                                        itemData={this.state.postListIds}
                                        itemKey={this.itemKey}
                                        overscanCountForward={OVERSCAN_COUNT_FORWARD}
                                        overscanCountBackward={OVERSCAN_COUNT_BACKWARD}
                                        onScroll={this.onScroll}
                                        onItemsRendered={this.onItemsRendered}
                                        initScrollToIndex={this.initScrollToIndex}
                                        canLoadMorePosts={this.canLoadMorePosts}
                                        skipResizeClass='col__reply'
                                        innerRef={this.postListRef}
                                        style={{...virtListStyles, ...dynamicListStyle}}
                                        innerListStyle={postListStyle}
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
