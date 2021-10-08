// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent, RefObject} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList, OnScrollArgs} from 'dynamic-virtualized-list';

import {$ID} from 'mattermost-redux/types/utilities';
import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import {Posts} from 'mattermost-redux/constants';
import {isDateLine, isStartOfNewMessages, isCreateComment} from 'mattermost-redux/utils/post_list';

import DelayedAction from 'utils/delayed_action';
import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants';
import {FakePost} from 'types/store/rhs';
import {getNewMessageIndex, getPreviousPostId, getLatestPostId} from 'utils/post_utils';

import FloatingTimestamp from 'components/post_view/floating_timestamp';
import {THREADING_TIME as BASE_THREADING_TIME} from 'components/threading/common/options';

import CreateComment from './create_comment';
import Row from './thread_viewer_row';

type Props = {
    channel: Channel;
    currentUserId: string;
    directTeammate: UserProfile | undefined;
    highlightedPostId?: $ID<Post>;
    lastPost: Post;
    onCardClick: (post: Post) => void;
    onCardClickPost: (post: Post) => void;
    replyListIds: string[];
    selected: Post | FakePost;
    teamId: string;
    useRelativeTimestamp: boolean;
    isThreadView: boolean;
}

type State = {
    createCommentHeight: number;
    isMobile: boolean;
    isScrolling: boolean;
    topRhsPostId?: string;
    userScrolled: boolean;
    userScrolledToBottom: boolean;
}

const virtListStyles = {
    position: 'absolute',
    top: '0',
    height: '100%',
    willChange: 'auto',
};

const CREATE_COMMENT_BUTTON_HEIGHT = 81;

const THREADING_TIME: typeof BASE_THREADING_TIME = {
    ...BASE_THREADING_TIME,
    units: [
        'now',
        'minute',
        'hour',
        'day',
        'week',
        'month',
        'year',
    ],
};

const OFFSET_TO_SHOW_TOAST = -50;
const OVERSCAN_COUNT_FORWARD = 30;
const OVERSCAN_COUNT_BACKWARD = 30;

class ThreadViewerVirtualized extends PureComponent<Props, State> {
    private mounted = false;
    private scrollStopAction: DelayedAction;
    postCreateContainerRef: RefObject<HTMLDivElement>;
    listRef: RefObject<DynamicSizeList>;
    innerRef: RefObject<HTMLDivElement>;
    initRangeToRender: number[];

    constructor(props: Props) {
        super(props);

        const postIndex = this.getInitialPostIndex();
        const isMobile = Utils.isMobile();

        this.initRangeToRender = [
            Math.max(postIndex - 30, 0),
            Math.max(postIndex + 30, Math.min(props.replyListIds.length - 1, 50)),
        ];

        this.listRef = React.createRef();
        this.innerRef = React.createRef();
        this.postCreateContainerRef = React.createRef();
        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        this.state = {
            createCommentHeight: 0,
            isMobile,
            isScrolling: false,
            userScrolled: false,
            userScrolledToBottom: false,
            topRhsPostId: undefined,
        };
    }

    componentDidMount() {
        this.mounted = true;
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', this.handleWindowResize);
    }

    componentDidUpdate(prevProps: Props) {
        const {highlightedPostId, lastPost, currentUserId} = this.props;

        if (highlightedPostId && prevProps.highlightedPostId !== highlightedPostId) {
            this.scrollToHighlightedPost();
        } else if (
            prevProps.lastPost.id !== lastPost.id &&
            (lastPost.user_id === currentUserId || this.state.userScrolledToBottom)
        ) {
            this.scrollToBottom();
        }
    }

    canLoadMorePosts() {}

    handleWindowResize = () => {
        const isMobile = Utils.isMobile();
        if (isMobile !== this.state.isMobile) {
            this.setState({
                isMobile,
            });
        }
    }

    initScrollToIndex = (): {index: number; position: string; offset?: number} => {
        const {highlightedPostId, replyListIds} = this.props;

        if (highlightedPostId) {
            const index = replyListIds.indexOf(highlightedPostId);
            return {
                index,
                position: 'center',
            };
        }

        const newMessagesSeparatorIndex = getNewMessageIndex(replyListIds);
        if (newMessagesSeparatorIndex > 0) {
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

    onScroll = ({scrollHeight, scrollUpdateWasRequested, scrollOffset, clientHeight}: OnScrollArgs) => {
        if (scrollHeight <= 0 || scrollUpdateWasRequested) {
            return;
        }
        const {createCommentHeight} = this.state;

        const userScrolledToBottom = scrollHeight - scrollOffset - createCommentHeight <= clientHeight;

        this.setState({
            isScrolling: true,
            userScrolled: true,
            userScrolledToBottom,
        });

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    updateFloatingTimestamp = (visibleTopItem: number) => {
        if (!this.props.replyListIds) {
            return;
        }

        this.setState({
            topRhsPostId: getLatestPostId(this.props.replyListIds.slice(visibleTopItem)),
        });
    }

    onItemsRendered = ({visibleStartIndex}: {visibleStartIndex: number}) => {
        if (this.state.isMobile) {
            this.updateFloatingTimestamp(visibleStartIndex);
        }
    }

    getInitialPostIndex = (): number => {
        let postIndex = 0;

        if (this.props.highlightedPostId) {
            postIndex = this.props.replyListIds.findIndex((postId) => postId === this.props.highlightedPostId);
        } else {
            postIndex = getNewMessageIndex(this.props.replyListIds);
        }

        return postIndex === -1 ? 0 : postIndex;
    }

    scrollToItem = (index: number, position: string, offset?: number) => {
        if (this.listRef.current) {
            this.listRef.current.scrollToItem(index, position, offset);
        }
    }

    scrollToBottom = () => {
        this.scrollToItem(0, 'end');
    }

    scrollToNewMessage = () => {
        this.scrollToItem(getNewMessageIndex(this.props.replyListIds), 'start', OFFSET_TO_SHOW_TOAST);
    }

    scrollToHighlightedPost = () => {
        const {highlightedPostId, replyListIds} = this.props;

        if (highlightedPostId) {
            this.scrollToItem(replyListIds.indexOf(highlightedPostId), 'center');
        }
    }

    handleScrollStop = () => {
        if (this.mounted) {
            this.setState({isScrolling: false});
        }
    }

    handleCreateCommentHeightChange = (height: number, maxHeight: number) => {
        let createCommentHeight = height > maxHeight ? maxHeight : height;
        createCommentHeight += CREATE_COMMENT_BUTTON_HEIGHT;

        if (createCommentHeight !== this.state.createCommentHeight) {
            this.setState({createCommentHeight});
            if (this.state.userScrolledToBottom) {
                this.scrollToBottom();
            }
        }
    }

    renderRow = ({data, itemId, style}: {data: any; itemId: any; style: any}) => {
        const index = data.indexOf(itemId);
        let className = '';
        let a11yIndex = 0;
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

        const isLastPost = itemId === this.props.lastPost.id;
        const isRootPost = itemId === this.props.selected.id;

        if (!isDateLine(itemId) && !isStartOfNewMessages(itemId) && !isCreateComment(itemId) && !isRootPost) {
            a11yIndex++;
        }

        return (
            <>
                {!isCreateComment(itemId) && (
                    <div
                        style={style}
                        className={className}
                    >
                        <Row
                            a11yIndex={a11yIndex}
                            currentUserId={this.props.currentUserId}
                            isRootPost={isRootPost}
                            isLastPost={isLastPost}
                            listId={itemId}
                            onCardClick={this.props.onCardClick}
                            onCardClickPost={this.props.onCardClickPost}
                            previousPostId={getPreviousPostId(data, index)}
                            teamId={this.props.teamId}
                            timestampProps={this.props.useRelativeTimestamp ? THREADING_TIME : undefined}
                        />
                    </div>
                )}

                {isCreateComment(itemId) && (
                    <CreateComment
                        focusOnMount={this.state.userScrolledToBottom || (!this.state.userScrolled && this.getInitialPostIndex() === 0)}
                        channelId={this.props.channel.id}
                        channelIsArchived={this.props.channel.delete_at !== 0}
                        channelType={this.props.channel.type}
                        isDeleted={(this.props.selected as Post).state === Posts.POST_DELETED}
                        isFakeDeletedPost={this.props.selected.type === Constants.PostTypes.FAKE_PARENT_DELETED}
                        latestPostId={this.props.lastPost.id}
                        onHeightChange={this.handleCreateCommentHeightChange}
                        ref={this.postCreateContainerRef}
                        teammate={this.props.directTeammate}
                        threadId={this.props.selected.id}
                        isThreadView={this.props.isThreadView}
                    />
                )}
            </>
        );
    };

    getInnerStyles = (): React.CSSProperties|undefined => {
        if (!this.props.useRelativeTimestamp) {
            return {
                paddingTop: '28px',
            };
        }

        return undefined;
    }

    render() {
        const {isMobile, topRhsPostId} = this.state;

        return (
            <>
                {isMobile && topRhsPostId && !this.props.useRelativeTimestamp && (
                    <FloatingTimestamp
                        isMobile={true}
                        isRhsPost={true}
                        isScrolling={this.state.isScrolling}
                        postId={topRhsPostId}
                    />
                )}
                <div
                    role='application'
                    aria-label={Utils.localizeMessage('accessibility.sections.rhsContent', 'message details complimentary region')}
                    className='post-right__content a11y__region'
                    style={{height: '100%'}}
                    data-a11y-sort-order='3'
                    data-a11y-focus-child={true}
                    data-a11y-order-reversed={true}
                >
                    <AutoSizer>
                        {({width, height}) => (
                            <DynamicSizeList
                                canLoadMorePosts={this.canLoadMorePosts}
                                height={height}
                                initRangeToRender={this.initRangeToRender}
                                initScrollToIndex={this.initScrollToIndex}
                                innerListStyle={this.getInnerStyles()}
                                innerRef={this.innerRef}
                                itemData={this.props.replyListIds}
                                onItemsRendered={this.onItemsRendered}
                                onScroll={this.onScroll}
                                overscanCountBackward={OVERSCAN_COUNT_BACKWARD}
                                overscanCountForward={OVERSCAN_COUNT_FORWARD}
                                ref={this.listRef}
                                style={virtListStyles}
                                width={width}
                            >
                                {this.renderRow}
                            </DynamicSizeList>
                        )}
                    </AutoSizer>
                </div>
            </>
        );
    }
}

export default ThreadViewerVirtualized;
