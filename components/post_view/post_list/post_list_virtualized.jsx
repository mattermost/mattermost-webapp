// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'react-window';
import {intlShape} from 'react-intl';
import {isDateLine, isStartOfNewMessages} from 'mattermost-redux/utils/post_list';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import Constants, {PostListRowListIds, EventTypes, PostRequestTypes} from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import {getPreviousPostId, getLatestPostId} from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import FloatingTimestamp from 'components/post_view/floating_timestamp';
import NewMessagesBelow from 'components/post_view/new_messages_below';
import PostListRow from 'components/post_view/post_list_row';
import ScrollToBottomArrows from 'components/post_view/scroll_to_bottom_arrows';

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
        postListIds: PropTypes.array.isRequired,

        /**
         * Set to focus this post
         */
        focusedPostId: PropTypes.string,

        /**
         * The current channel id
         */
        channelId: PropTypes.string.isRequired,

        /**
         * Used for disabling auto retry of posts and enabling manual link for loading posts
         */
        autoRetryEnable: PropTypes.bool,

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

        latestPostTimeStamp: PropTypes.number,

        latestAriaLabelFunc: PropTypes.func,

        actions: PropTypes.shape({

            /**
             * Function to get older posts in the channel
             */
            loadOlderPosts: PropTypes.func.isRequired,

            /**
             * Function to get newer posts in the channel
             */
            loadNewerPosts: PropTypes.func.isRequired,

            /**
             * Function used for autoLoad of posts incase screen is not filled with posts
             */
            canLoadMorePosts: PropTypes.func.isRequired,

            /**
             * Function to check and set if app is in mobile view
             */
            checkAndSetMobileView: PropTypes.func.isRequired,

            /**
             * Function to change the post selected for postList
             */
            changeUnreadChunkTimeStamp: PropTypes.func.isRequired,
        }).isRequired,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        const channelIntroMessage = PostListRowListIds.CHANNEL_INTRO_MESSAGE;
        const isMobile = Utils.isMobile();
        this.state = {
            isScrolling: false,
            isMobile,
            atBottom: false,
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

        let postIndex = 0;
        if (props.focusedPostId) {
            postIndex = this.props.postListIds.findIndex((postId) => postId === this.props.focusedPostId);
        } else {
            postIndex = this.getNewMessagesSeparatorIndex(props.postListIds);
        }

        const maxPostsForSlicing = props.focusedPostId ? MAXIMUM_POSTS_FOR_SLICING.permalink : MAXIMUM_POSTS_FOR_SLICING.channel;
        this.initRangeToRender = [
            Math.max(postIndex - 30, 0),
            Math.max(postIndex + 30, Math.min(props.postListIds.length - 1, maxPostsForSlicing)),
        ];
    }

    componentDidMount() {
        this.mounted = true;
        this.props.actions.checkAndSetMobileView();

        window.addEventListener('resize', this.handleWindowResize);

        EventEmitter.addListener(EventTypes.POST_LIST_SCROLL_CHANGE, this.scrollChange);
    }

    getSnapshotBeforeUpdate(prevProps) {
        if (this.postListRef && this.postListRef.current) {
            const postsAddedAtTop = this.props.postListIds && this.props.postListIds.length !== prevProps.postListIds.length && this.props.postListIds[0] === prevProps.postListIds[0];
            const channelHeaderAdded = this.props.olderPosts.allLoaded !== prevProps.olderPosts.allLoaded;
            if ((postsAddedAtTop || channelHeaderAdded) && !this.state.atBottom) {
                const postListNode = this.postListRef.current;
                const previousScrollTop = postListNode.parentElement.scrollTop;
                const previousScrollHeight = postListNode.scrollHeight;

                return {
                    previousScrollTop,
                    previousScrollHeight,
                };
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.postListRef.current || !snapshot) {
            return;
        }

        const postlistScrollHeight = this.postListRef.current.scrollHeight;
        const postsAddedAtTop = this.props.postListIds.length !== prevProps.postListIds.length && this.props.postListIds[0] === prevProps.postListIds[0];
        const channelHeaderAdded = this.props.olderPosts.allLoaded !== prevProps.olderPosts.allLoaded;
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

    static getDerivedStateFromProps(props) {
        const postListIds = props.postListIds;
        let newPostListIds;

        if (props.olderPosts.allLoaded) {
            newPostListIds = [...postListIds, PostListRowListIds.CHANNEL_INTRO_MESSAGE];
        } else if (props.autoRetryEnable) {
            newPostListIds = [...postListIds, PostListRowListIds.OLDER_MESSAGES_LOADER];
        } else {
            newPostListIds = [...postListIds, PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER];
        }

        if (!props.newerPosts.allLoaded) {
            if (props.autoRetryEnable) {
                newPostListIds = [PostListRowListIds.NEWER_MESSAGES_LOADER, ...newPostListIds];
            } else {
                newPostListIds = [PostListRowListIds.LOAD_NEWER_MESSAGES_TRIGGER, ...newPostListIds];
            }
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
            this.scrollToLatestMessages();
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
                    shouldHighlight={itemId === this.props.focusedPostId}
                    loadOlderPosts={this.props.actions.loadOlderPosts}
                    loadNewerPosts={this.props.actions.loadNewerPosts}
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
        const didUserScrollBackwards = scrollDirection === 'backward' && !scrollUpdateWasRequested;
        const didUserScrollForwards = scrollDirection === 'forward' && !scrollUpdateWasRequested;
        const isOffsetWithInRange = scrollOffset < HEIGHT_TRIGGER_FOR_MORE_POSTS;
        const offsetFromBottom = (scrollHeight - clientHeight) - scrollOffset < HEIGHT_TRIGGER_FOR_MORE_POSTS;
        const canLoadOlderPosts = !this.props.olderPosts.allLoaded && !this.props.olderPosts.loading;
        const canLoadNewerPosts = !this.props.newerPosts.allLoaded && !this.props.newerPosts.loading;

        if (didUserScrollBackwards && isOffsetWithInRange && canLoadOlderPosts) {
            this.props.actions.loadOlderPosts();
        } else if (didUserScrollForwards && offsetFromBottom && canLoadNewerPosts) {
            this.props.actions.loadNewerPosts();
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

        if (scrollUpdateWasRequested) { //if scroll change is programatically requested i.e by calling scrollTo
            //This is a private method on virtlist
            const postsRenderedRange = this.listRef.current._getRangeToRender(); //eslint-disable-line no-underscore-dangle

            // postsRenderedRange[3] is the visibleStopIndex which is post at the bottom of the screen
            if (postsRenderedRange[3] <= 1 && canLoadNewerPosts) {
                this.props.actions.canLoadMorePosts(PostRequestTypes.AFTER_ID);
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

        return offsetFromBottom <= BUFFER_TO_BE_CONSIDERED_BOTTOM && scrollHeight > 0;
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

        const newMessagesSeparatorIndex = this.state.postListIds.findIndex(
            (item) => item.indexOf(PostListRowListIds.START_OF_NEW_MESSAGES) === 0
        );

        if (newMessagesSeparatorIndex > 0) {
            // if there is a dateLine above START_OF_NEW_MESSAGES then scroll to date line
            if (isDateLine(this.state.postListIds[newMessagesSeparatorIndex + 1])) {
                return {
                    index: newMessagesSeparatorIndex + 1,
                    position: 'start',
                };
            }
            return {
                index: newMessagesSeparatorIndex,
                position: 'start',
            };
        }

        this.setState({atBottom: true});
        return {
            index: 0,
            position: 'end',
        };
    }

    scrollToLatestMessages = () => {
        if (this.props.newerPosts.allLoaded) {
            this.scrollToBottom();
        } else {
            this.props.actions.changeUnreadChunkTimeStamp('');
        }
    }

    scrollToBottom = () => {
        this.listRef.current.scrollToItem(0, 'end');
    }

    render() {
        const channelId = this.props.channelId;
        let ariaLabel;
        if (this.props.latestAriaLabelFunc && this.props.postListIds.indexOf(PostListRowListIds.START_OF_NEW_MESSAGES) >= 0) {
            ariaLabel = this.props.latestAriaLabelFunc(this.context.intl);
        }
        const {dynamicListStyle} = this.state;

        let newMessagesBelow = null;
        if (!this.props.focusedPostId) {
            newMessagesBelow = (
                <NewMessagesBelow
                    atBottom={this.state.atBottom}
                    lastViewedBottom={this.state.lastViewedBottom}
                    postIds={this.state.postListIds}
                    onClick={this.scrollToLatestMessages}
                    channelId={channelId}
                />
            );
        }

        return (
            <div
                id='post-list'
                className='a11y__region'
                data-a11y-sort-order='1'
                data-a11y-focus-child={true}
                data-a11y-order-reversed={true}
                data-a11y-loop-navigation={false}
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
                    key={'postlist-' + channelId}
                >
                    <div
                        role='presentation'
                        className='post-list__table'
                    >
                        <div
                            id='postListContent'
                            className='post-list__content'
                        >
                            <span
                                className='sr-only'
                                aria-live='polite'
                            >
                                {ariaLabel}
                            </span>
                            <AutoSizer>
                                {({height, width}) => (
                                    <DynamicSizeList
                                        role='listbox'
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
                                        canLoadMorePosts={this.props.actions.canLoadMorePosts}
                                        skipResizeClass='col__reply'
                                        innerRef={this.postListRef}
                                        style={{...virtListStyles, ...dynamicListStyle}}
                                        innerListStyle={postListStyle}
                                        initRangeToRender={this.initRangeToRender}
                                        loaderId={PostListRowListIds.OLDER_MESSAGES_LOADER}
                                        correctScrollToBottom={this.props.newerPosts.allLoaded}
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
