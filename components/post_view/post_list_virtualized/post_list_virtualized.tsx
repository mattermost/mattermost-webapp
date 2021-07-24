// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {DetailedHTMLProps, HTMLAttributes, RefObject, CSSProperties, ReactText} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'dynamic-virtualized-list';
import {injectIntl, WrappedComponentProps, IntlShape} from 'react-intl';

import {isDateLine, isStartOfNewMessages} from 'mattermost-redux/utils/post_list';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import Constants, {PostListRowListIds, EventTypes, PostRequestTypes} from 'utils/constants';
import DelayedAction from 'utils/delayed_action';
import {getPreviousPostId, getLatestPostId, getNewMessageIndex} from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import FloatingTimestamp from 'components/post_view/floating_timestamp';
import PostListRow from 'components/post_view/post_list_row';
import ScrollToBottomArrows from 'components/post_view/scroll_to_bottom_arrows';
import ToastWrapper from 'components/toast_wrapper';

const OVERSCAN_COUNT_BACKWARD = 80;
const OVERSCAN_COUNT_FORWARD = 80;
const HEIGHT_TRIGGER_FOR_MORE_POSTS = 1000;
const BUFFER_TO_BE_CONSIDERED_BOTTOM = 10;

const MAXIMUM_POSTS_FOR_SLICING = {
    channel: 50,
    permalink: 100,
};

const postListStyle: CSSProperties = {
    padding: '14px 0px 7px',
};

const virtListStyles: CSSProperties = {
    position: 'absolute',
    bottom: '0',
    maxHeight: '100%',
};

const OFFSET_TO_SHOW_TOAST = -50;

type RowData = {
    data: string[];
    itemId: string;
    style?: CSSProperties;
};

type OnItemsRenderedArgs = {

    /**
     * Index of first item in view
     */
    visibleStartIndex: number;

    /**
     * Index of the first item rendered.
     */
    overscanStartIndex?: number;

    /**
     * Index of the last item rendered.
     */
    overscanStopIndex?: number;

    /**
     * Index of the last visible item in view.
     */
    visibleStopIndex?: number;
};

type ScrollToIndex = {
    index: number;
    position: string;
    offset?: number;
};

type Timestamp = number;

type SpanAttribute = DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

type OnScrollArgs = {
    scrollDirection: 'backward' | 'forward';
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
    clientHeight: number;
    scrollHeight: number;
};

type ScrollPosition = {
    previousScrollTop: number;
    previousScrollHeight: number;
};

type Snapshot = ScrollPosition | null;

export interface PostListProps extends WrappedComponentProps<'intl'> {

    /**
    * Array of Ids in the channel including date separators, new message indicator, more messages loader,
     * manual load messages trigger and postId in the order of newest to oldest for populating virtual list rows
    */
    postListIds: string[];

    /**
     * Set to focus this post
     */
    focusedPostId?: string;

    /**
    * The current channel id
    */
    channelId: string;

    /**
    * Used for disabling auto retry of posts and enabling manual link for loading posts
    */
    autoRetryEnable?: boolean;

    /**
    * used for populating header, scroll correction and disabling triggering loadOlderPosts
    */
    atOldestPost: boolean;

    /**
     * used for disabling triggering loadNewerPosts
    */
    atLatestPost: boolean;

    /**
    * used in passing to post row for enabling animation when loading posts
    */
    loadingNewerPosts: boolean;
    loadingOlderPosts: boolean;

    latestPostTimeStamp: number;
    latestAriaLabelFunc?: (ariaLabel: IntlShape) => SpanAttribute;
    lastViewedAt?: string | Timestamp;

    actions: PostListActions;
};

interface PostListActions {

    /**
    * Function to get older posts in the channel
     */
    loadOlderPosts: () => void;

    /**
     * Function to get newer posts in the channel
    */
    loadNewerPosts: () => void;

    /**
    * Function used for autoLoad of posts incase screen is not filled with posts
     */
    canLoadMorePosts: (id?: string) => void;

    /**
     * Function to check and set if app is in mobile view
     */
    checkAndSetMobileView: () => void;

    changeUnreadChunkTimeStamp: (lastViewedAt: string | Timestamp | ReactText) => void;
    updateNewMessagesAtInChannel: (channelId: string, lastViewedAt: Timestamp) => void;

};

export type PostListState = {
    isScrolling: boolean;
    isMobile: boolean | null;
    atBottom: boolean | null;
    lastViewedBottom: Timestamp;
    postListIds: string[];
    topPostId: string;
    postMenuOpened: boolean | undefined;
    dynamicListStyle: {
        willChange: string;
    };
    initScrollCompleted: boolean;
    showSearchHint: boolean;
    isSearchHintDismissed: boolean;
    initScrollOffsetFromBottom: number;
};

class PostList extends React.PureComponent<PostListProps, PostListState, Snapshot> {
    listRef: RefObject<any>;
    postListRef: RefObject<any>;
    scrollStopAction!: DelayedAction;
    initRangeToRender: number[];
    mounted!: boolean;
    showSearchHintThreshold: number;

    constructor(props: Readonly<PostListProps>) {
        super(props);

        const channelIntroMessage = PostListRowListIds.CHANNEL_INTRO_MESSAGE;
        const isMobile = Utils.isMobile();
        this.state = {
            isScrolling: false,
            isMobile,

            /* Intentionally setting null so that toast can determine when the first time this state is defined */
            atBottom: null,
            lastViewedBottom: Date.now(),
            postListIds: [channelIntroMessage],
            topPostId: '',
            postMenuOpened: false,
            dynamicListStyle: {
                willChange: 'transform',
            },
            initScrollCompleted: false,
            initScrollOffsetFromBottom: 0,

            showSearchHint: false,
            isSearchHintDismissed: false,
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

        this.showSearchHintThreshold = this.getShowSearchHintThreshold();
    }

    componentDidMount() {
        this.mounted = true;
        this.props.actions.checkAndSetMobileView();

        window.addEventListener('resize', this.handleWindowResize);
        EventEmitter.addListener(EventTypes.POST_LIST_SCROLL_TO_BOTTOM, this.scrollToLatestMessages);
    }

    getSnapshotBeforeUpdate(prevProps: Readonly<PostListProps>): Snapshot {
        if (this.postListRef && this.postListRef.current) {
            const postsAddedAtTop = this.props.postListIds && this.props.postListIds.length !== prevProps.postListIds.length && this.props.postListIds[0] === prevProps.postListIds[0];
            const channelHeaderAdded = this.props.atOldestPost !== prevProps.atOldestPost;
            if ((postsAddedAtTop || channelHeaderAdded) && this.state.atBottom === false) {
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

    componentDidUpdate(prevProps: Readonly<PostListProps>, _prevState: PostListState, snapshot: Snapshot) {
        if (!this.postListRef.current) {
            return;
        }
        const prevPostsCount = prevProps.postListIds.length;
        const presentPostsCount = this.props.postListIds.length;

        if (snapshot) {
            const postlistScrollHeight = this.postListRef.current.scrollHeight;
            const postsAddedAtTop = presentPostsCount !== prevPostsCount && this.props.postListIds[0] === prevProps.postListIds[0];
            const channelHeaderAdded = this.props.atOldestPost !== prevProps.atOldestPost;
            if ((postsAddedAtTop || channelHeaderAdded) && !this.state.atBottom && snapshot) {
                const scrollValue = snapshot.previousScrollTop + (postlistScrollHeight - snapshot.previousScrollHeight);
                if (scrollValue !== 0 && (scrollValue - snapshot.previousScrollTop) !== 0) {
                    //true as third param so chrome can use animationFrame when correcting scroll
                    this.listRef.current.scrollTo(scrollValue, scrollValue - snapshot.previousScrollTop, true);
                }
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', this.handleWindowResize);
        EventEmitter.removeListener(EventTypes.POST_LIST_SCROLL_TO_BOTTOM, this.scrollToLatestMessages);
    }

    static getDerivedStateFromProps(props: Readonly<PostListProps>): Partial<PostListState> | null {
        const postListIds = props.postListIds;
        let newPostListIds;

        if (props.atOldestPost) {
            newPostListIds = [...postListIds, PostListRowListIds.CHANNEL_INTRO_MESSAGE];
        } else if (props.autoRetryEnable) {
            newPostListIds = [...postListIds, PostListRowListIds.OLDER_MESSAGES_LOADER];
        } else {
            newPostListIds = [...postListIds, PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER];
        }

        if (!props.atLatestPost) {
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

    getNewMessagesSeparatorIndex = (postListIds: string[]): number => {
        return postListIds.findIndex(
            (item) => item.indexOf(PostListRowListIds.START_OF_NEW_MESSAGES) === 0,
        );
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

        this.showSearchHintThreshold = this.getShowSearchHintThreshold();
    }

    togglePostMenu = (opened: boolean) => {
        const dynamicListStyle = this.state.dynamicListStyle;
        if (this.state.isMobile) {
            dynamicListStyle.willChange = opened ? 'unset' : 'transform';
        }

        this.setState({
            postMenuOpened: opened,
            dynamicListStyle,
        });
    };

    renderRow = ({data, itemId, style}: RowData) => {
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

        // Since the first in the list is the latest message
        const isLastPost = itemId === this.state.postListIds[0];

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
                    isLastPost={isLastPost}
                    loadingNewerPosts={this.props.loadingNewerPosts}
                    loadingOlderPosts={this.props.loadingOlderPosts}
                />
            </div>
        );
    };

    scrollToFailed = (index: number) => {
        if (index === 0) {
            this.props.actions.changeUnreadChunkTimeStamp('');
        } else {
            this.props.actions.changeUnreadChunkTimeStamp(this.props.lastViewedAt);
        }
    }

    onScroll = ({scrollDirection, scrollOffset, scrollUpdateWasRequested, clientHeight, scrollHeight}: OnScrollArgs) => {
        if (scrollHeight <= 0) {
            return;
        }

        const didUserScrollBackwards = scrollDirection === 'backward' && !scrollUpdateWasRequested;
        const didUserScrollForwards = scrollDirection === 'forward' && !scrollUpdateWasRequested;
        const isOffsetWithInRange = scrollOffset < HEIGHT_TRIGGER_FOR_MORE_POSTS;
        const offsetFromBottom = (scrollHeight - clientHeight) - scrollOffset;
        const shouldLoadNewPosts = offsetFromBottom < HEIGHT_TRIGGER_FOR_MORE_POSTS;

        if (didUserScrollBackwards && isOffsetWithInRange && !this.props.atOldestPost) {
            this.props.actions.loadOlderPosts();
        } else if (didUserScrollForwards && shouldLoadNewPosts && !this.props.atLatestPost) {
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

        this.checkBottom(scrollOffset, scrollHeight, clientHeight);

        if (scrollUpdateWasRequested) { //if scroll change is programatically requested i.e by calling scrollTo
            //This is a private method on virtlist
            const postsRenderedRange = this.listRef.current._getRangeToRender(); //eslint-disable-line no-underscore-dangle

            // postsRenderedRange[3] is the visibleStopIndex which is post at the bottom of the screen
            if (postsRenderedRange[3] <= 1 && !this.props.atLatestPost) {
                this.props.actions.canLoadMorePosts(PostRequestTypes.AFTER_ID);
            }

            if (!this.state.atBottom && scrollHeight) {
                this.setState({
                    initScrollOffsetFromBottom: offsetFromBottom,
                });
            }
        }

        if (this.state.isMobile && this.state.showSearchHint) {
            this.setState({
                showSearchHint: false,
            });
        }

        if (!this.state.isMobile && !this.state.isSearchHintDismissed) {
            this.setState({
                showSearchHint: offsetFromBottom > this.showSearchHintThreshold,
            });
        }
    }

    getShowSearchHintThreshold = (): number => {
        return window.screen.height * 3;
    }

    checkBottom = (scrollOffset: number, scrollHeight: number, clientHeight: number) => {
        this.updateAtBottom(this.isAtBottom(scrollOffset, scrollHeight, clientHeight));
    }

    isAtBottom = (scrollOffset: number, scrollHeight: number, clientHeight: number) => {
        // Calculate how far the post list is from being scrolled to the bottom
        const offsetFromBottom = scrollHeight - clientHeight - scrollOffset;

        return offsetFromBottom <= BUFFER_TO_BE_CONSIDERED_BOTTOM && scrollHeight > 0;
    }

    updateAtBottom = (atBottom: boolean) => {
        if (atBottom !== this.state.atBottom) {
            // Update lastViewedBottom when the list reaches or leaves the bottom
            let lastViewedBottom = Date.now();
            if (this.props.latestPostTimeStamp > lastViewedBottom) {
                lastViewedBottom = this.props.latestPostTimeStamp;
            }

            // if we hit the bottom, we haven't just landed on the unread channel
            this.setState({
                atBottom,
                lastViewedBottom,
            });
        }
    }

    updateLastViewedBottomAt = (lastViewedBottom = Date.now()) => {
        this.setState({
            lastViewedBottom,
        });
    }

    handleScrollStop = () => {
        if (this.mounted) {
            this.setState({
                isScrolling: false,
            });
        }
    }

    handleSearchHintDismiss = () => {
        this.setState({
            showSearchHint: false,
            isSearchHintDismissed: true,
        });
    }

    updateFloatingTimestamp = (visibleTopItem: number) => {
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

    onItemsRendered = ({visibleStartIndex}: OnItemsRenderedArgs) => {
        this.updateFloatingTimestamp(visibleStartIndex);
    }

    initScrollToIndex = (): ScrollToIndex => {
        if (this.props.focusedPostId) {
            const index = this.state.postListIds.findIndex(
                (item) => item === this.props.focusedPostId,
            );
            return {
                index,
                position: 'center',
            };
        }

        const newMessagesSeparatorIndex = getNewMessageIndex(this.state.postListIds);

        if (newMessagesSeparatorIndex > 0) {
            // if there is a dateLine above START_OF_NEW_MESSAGES then scroll to date line
            if (isDateLine(this.state.postListIds[newMessagesSeparatorIndex + 1])) {
                return {
                    index: newMessagesSeparatorIndex + 1,
                    position: 'start',
                    offset: OFFSET_TO_SHOW_TOAST,
                };
            }
            return {
                index: newMessagesSeparatorIndex,
                position: 'start',
                offset: OFFSET_TO_SHOW_TOAST,
            };
        }

        return {
            index: 0,
            position: 'end',
        };
    }

    scrollToLatestMessages = () => {
        if (this.props.atLatestPost) {
            this.scrollToBottom();
        } else {
            this.updateNewMessagesAtInChannel();
            this.props.actions.changeUnreadChunkTimeStamp('');
        }
    }

    scrollToBottom = () => {
        this.listRef.current.scrollToItem(0, 'end');
    }

    scrollToNewMessage = () => {
        this.listRef.current.scrollToItem(getNewMessageIndex(this.state.postListIds), 'start', OFFSET_TO_SHOW_TOAST);
    }

    updateNewMessagesAtInChannel = (lastViewedAt = Date.now()) => {
        this.props.actions.updateNewMessagesAtInChannel(this.props.channelId, lastViewedAt);
    }

    renderToasts = (width: number) => {
        return (
            <ToastWrapper
                atLatestPost={this.props.atLatestPost}
                postListIds={this.state.postListIds}
                atBottom={this.state.atBottom}
                width={width}
                lastViewedBottom={this.state.lastViewedBottom}
                latestPostTimeStamp={this.props.latestPostTimeStamp}
                scrollToNewMessage={this.scrollToNewMessage}
                scrollToLatestMessages={this.scrollToLatestMessages}
                updateNewMessagesAtInChannel={this.updateNewMessagesAtInChannel}
                updateLastViewedBottomAt={this.updateLastViewedBottomAt}
                channelId={this.props.channelId}
                focusedPostId={this.props.focusedPostId}
                initScrollOffsetFromBottom={this.state.initScrollOffsetFromBottom}
                onSearchHintDismiss={this.handleSearchHintDismiss}
                showSearchHintToast={this.state.showSearchHint}
            />
        );
    }

    render() {
        const channelId = this.props.channelId;
        let ariaLabel;
        if (this.props.latestAriaLabelFunc && this.props.postListIds.indexOf(PostListRowListIds.START_OF_NEW_MESSAGES) >= 0) {
            ariaLabel = this.props.latestAriaLabelFunc(this.props.intl);
        }
        const {dynamicListStyle} = this.state;

        return (
            <div
                role='list'
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
                                {({height, width}: any) => (
                                    <React.Fragment>
                                        <div>{this.renderToasts(width)}</div>

                                        <DynamicSizeList
                                            ref={this.listRef}
                                            height={height}
                                            width={width}
                                            className='post-list__dynamic'
                                            itemData={this.state.postListIds}
                                            overscanCountForward={OVERSCAN_COUNT_FORWARD}
                                            overscanCountBackward={OVERSCAN_COUNT_BACKWARD}
                                            onScroll={this.onScroll}
                                            initScrollToIndex={this.initScrollToIndex}
                                            canLoadMorePosts={this.props.actions.canLoadMorePosts}
                                            innerRef={this.postListRef}
                                            style={{...virtListStyles, ...dynamicListStyle}}
                                            innerListStyle={postListStyle}
                                            initRangeToRender={this.initRangeToRender}
                                            loaderId={PostListRowListIds.OLDER_MESSAGES_LOADER}
                                            correctScrollToBottom={this.props.atLatestPost}
                                            onItemsRendered={this.onItemsRendered}
                                            scrollToFailed={this.scrollToFailed}
                                        >
                                            {this.renderRow}
                                        </DynamicSizeList>
                                    </React.Fragment>
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(PostList);
export { PostList as PostListType}
