// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'react-window';
import {isDateLine, isStartOfNewMessages} from 'mattermost-redux/utils/post_list';

import {debounce} from 'mattermost-redux/actions/helpers';
import EventEmitter from 'mattermost-redux/utils/event_emitter';

import LoadingScreen from 'components/loading_screen.jsx';

import Constants, {PostListRowListIds, EventTypes} from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import {getOldestPostId, getPreviousPostId, getLatestPostId} from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import FloatingTimestamp from 'components/post_view/floating_timestamp';
import NewMessagesBelow from 'components/post_view/new_messages_below';
import PostListRow from 'components/post_view/post_list_row';
import ScrollToBottomArrows from 'components/post_view/scroll_to_bottom_arrows';

const MAX_NUMBER_OF_AUTO_RETRIES = 3;

const MAX_EXTRA_PAGES_LOADED = 10;
const OVERSCAN_COUNT_BACKWARD = window.OVERSCAN_COUNT_BACKWARD || 80; // Exposing the value for PM to test will be removed soon
const OVERSCAN_COUNT_FORWARD = window.OVERSCAN_COUNT_FORWARD || 80; // Exposing the value for PM to test will be removed soon
const HEIGHT_TRIGGER_FOR_MORE_POSTS = window.HEIGHT_TRIGGER_FOR_MORE_POSTS || 1000; // Exposing the value for PM to test will be removed soon
const BUFFER_TO_BE_CONSIDERED_BOTTOM = 10;

const MAXIMUM_POSTS_FOR_SLICING = {
    channel: 50,
    permalink: 100,
};

const postListStyle = {
    padding: '14px 0px 7px',
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

        latestPostTimeStamp: PropTypes.number,

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

            /**
             * Function to be called on recurring channel visits to get any possible missing latest posts
             */
            syncPostsInChannel: PropTypes.func.isRequired,
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

        this.initRangeToRender = this.props.focusedPostId ? [0, MAXIMUM_POSTS_FOR_SLICING.permalink] : [0, MAXIMUM_POSTS_FOR_SLICING.channel];

        if (!this.state.loadingFirstSetOfPosts) {
            const newMessagesSeparatorIndex = this.getNewMessagesSeparatorIndex(props.postListIds);
            this.initRangeToRender = [
                Math.max(newMessagesSeparatorIndex - 30, 0),
                Math.max(newMessagesSeparatorIndex + 30, Math.min(props.postListIds.length - 1, MAXIMUM_POSTS_FOR_SLICING.channel)),
            ];
        }
    }

    componentDidMount() {
        this.mounted = true;
        if (!this.props.channelLoading) {
            this.loadPosts(this.props.channel.id, this.props.focusedPostId);
        }
        this.props.actions.checkAndSetMobileView();

        window.addEventListener('resize', this.handleWindowResize);

        EventEmitter.addListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.scrollChange);
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (this.postListRef && this.postListRef.current) {
            const postsAddedAtTop = this.state.postListIds.length !== prevState.postListIds.length && this.state.postListIds[0] === prevState.postListIds[0];
            const channelHeaderAdded = this.state.atEnd !== prevState.atEnd;
            if ((postsAddedAtTop || channelHeaderAdded) && !this.state.atBottom) {
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
        const channelHeaderAdded = this.state.atEnd !== prevState.atEnd;
        if ((postsAddedAtTop || channelHeaderAdded) && !this.state.atBottom) {
            const scrollValue = snapshot.previousScrollTop + (postlistScrollHeight - snapshot.previousScrollHeight);
            if (scrollValue !== 0 && (scrollValue - snapshot.previousScrollTop) !== 0) {
                //true as third param so chrome can use animationFrame when correcting scroll
                this.listRef.current.scrollTo(scrollValue, scrollValue - snapshot.previousScrollTop, true);
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', this.handleWindowResize);

        EventEmitter.removeListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.scrollChange);
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

    getNewMessagesSeparatorIndex = (postListIds) => {
        return postListIds.findIndex(
            (item) => item.indexOf(PostListRowListIds.START_OF_NEW_MESSAGES) === 0
        );
    }

    scrollChange = (toBottom) => {
        if (toBottom) {
            this.scrollToBottom();
        }
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

        if (this.state.loadingFirstSetOfPosts) {
            const {hasMoreBefore} = await this.props.actions.loadInitialPosts(channelId, focusedPostId);

            if (this.mounted) {
                this.setState({
                    loadingFirstSetOfPosts: false,
                    atEnd: !hasMoreBefore,
                });
            }
        } else {
            await this.props.actions.syncPostsInChannel(channelId, this.props.latestPostTimeStamp);
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
        return getOldestPostId(this.state.postListIds);
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
        let className = '';
        const basePaddingClass = 'post-row__padding';
        const previousItemId = (index !== -1 && index < data.length - 1) ? data[index + 1] : '';
        const nextItemId = (index > 0 && index < data.length) ? data[index - 1] : '';

        if (isDateLine(nextItemId) || isStartOfNewMessages(nextItemId)) {
            className += basePaddingClass + ' bottom';
        }

        if (isDateLine(previousItemId) || isStartOfNewMessages(previousItemId)) {
            if (className.includes(basePaddingClass)) {
                className += ' top';
            } else {
                className += basePaddingClass + ' top';
            }
        }

        return (
            <div
                style={style}
                className={className}
            >
                <PostListRow
                    listId={itemId}
                    previousListId={getPreviousPostId(data, index)}
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

    onScroll = ({scrollDirection, scrollOffset, scrollUpdateWasRequested, clientHeight, scrollHeight}) => {
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

        this.checkBottom(scrollOffset, scrollHeight, clientHeight);
    }

    checkBottom = (scrollOffset, scrollHeight, clientHeight) => {
        this.updateAtBottom(this.isAtBottom(scrollOffset, scrollHeight, clientHeight));
    }

    isAtBottom = (scrollOffset, scrollHeight, clientHeight) => {
        // Calculate how far the post list is from being scrolled to the bottom
        const offsetFromBottom = scrollHeight - clientHeight - scrollOffset;

        return offsetFromBottom <= BUFFER_TO_BE_CONSIDERED_BOTTOM;
    }

    updateAtBottom = (atBottom) => {
        if (atBottom !== this.state.atBottom) {
            // Update lastViewedBottom when the list reaches or leaves the bottom
            let lastViewedBottom = Date.now();
            if (this.props.latestPostTimeStamp > lastViewedBottom) {
                lastViewedBottom = this.props.latestPostTimeStamp;
            }

            this.setState({
                atBottom,
                lastViewedBottom,
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
            topPostId: getLatestPostId(this.props.postListIds.slice(visibleTopItem)),
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
        const newMessagesSeparatorIndex = this.getNewMessagesSeparatorIndex(this.state.postListIds);

        if (newMessagesSeparatorIndex > 0) {
            const topMostPostIndex = this.state.postListIds.indexOf(getOldestPostId(this.state.postListIds));
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
        const {dynamicListStyle} = this.state;

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

        let newMessagesBelow = null;
        if (!this.props.focusedPostId) {
            newMessagesBelow = (
                <NewMessagesBelow
                    atBottom={this.state.atBottom}
                    lastViewedBottom={this.state.lastViewedBottom}
                    postIds={this.state.postListIds}
                    onClick={this.scrollToBottom}
                    channelId={this.props.channel.id}
                />
            );
        }

        return (
            <div
                id='post-list'
                aria-label={Utils.localizeMessage('accessibility.sections.centerContent', 'message list main region')}
            >
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
                    role='presentation'
                    className='post-list-holder-by-time'
                    key={'postlist-' + channel.id}
                >
                    <div
                        role='presentation'
                        className='post-list__table'
                    >
                        <div
                            role='presentation'
                            id='postListContent'
                            className='post-list__content'
                        >
                            <AutoSizer>
                                {({height, width}) => (
                                    <DynamicSizeList
                                        role='presentation'
                                        ref={this.listRef}
                                        height={height}
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
                                        initRangeToRender={this.initRangeToRender}
                                        loaderId={PostListRowListIds.MORE_MESSAGES_LOADER}
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
