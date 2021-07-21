// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent, RefObject} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {DynamicSizeList} from 'dynamic-virtualized-list';
import memoize from 'memoize-one';

import {$ID} from 'mattermost-redux/types/utilities';
import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import {Posts} from 'mattermost-redux/constants';
import {isDateLine, isStartOfNewMessages} from 'mattermost-redux/utils/post_list';

import DelayedAction from 'utils/delayed_action';
import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants';
import {FakePost} from 'types/store/rhs';
import {getNewMessageIndex, getPreviousPostId, getLatestPostId} from 'utils/post_utils';

import FloatingTimestamp from 'components/post_view/floating_timestamp';
import {THREADING_TIME as BASE_THREADING_TIME} from 'components/threading/common/options';

import CreateComment from './create_comment';
import Row from './thread_viewer_row';

export type OwnProps = {
    channel: Channel;
    onCardClick: (post: Post) => void;
    onCardClickPost: (post: Post) => void;
    openTime: number;
    postIds: Array<$ID<Post | FakePost>>;
    removePost: (post: Post) => void;
    selected: Post | FakePost;
    useRelativeTimestamp: boolean;
};

type Props = {
    currentUserId: string;
    directTeammate: UserProfile | undefined;
    highlightedPostId?: $ID<Post>;
    lastPost: Post;
    previewCollapsed: string;
    previewEnabled: boolean;
    replyListIds: string[];
    teamId: string;
} & OwnProps;

type State = {
    isScrolling: boolean;
    topRhsPostId?: string;
    userScrolled: boolean;
    userScrolledToBottom: boolean;
}

const virtListStyles = {
    position: 'absolute',
    top: '0',
    maxHeight: '100%',
};

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

const OFFSET_TO_SHOW_TOAST = Number(-50);
const OVERSCAN_COUNT_FORWARD = 30;
const OVERSCAN_COUNT_BACKWARD = 30;

class ThreadViewerVirtualized extends PureComponent<Props, State> {
    private scrollStopAction: DelayedAction;
    postCreateContainerRef: React.RefObject<HTMLDivElement>;
    listRef: RefObject<DynamicSizeList>;
    innerRef: RefObject<HTMLDivElement>;
    initRangeToRender: number[];

    constructor(props: Props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);
        this.listRef = React.createRef();
        this.innerRef = React.createRef();

        const postIndex = this.getInitialPostIndex();

        this.initRangeToRender = [
            Math.max(postIndex - 30, 0),
            Math.max(postIndex + 30, Math.min(props.replyListIds.length - 1, 50)),
        ];

        this.postCreateContainerRef = React.createRef();
        this.listRef = React.createRef();
        this.innerRef = React.createRef();

        this.state = {
            isScrolling: false,
            userScrolled: false,
            userScrolledToBottom: false,
            topRhsPostId: undefined,
        };
    }

    componentDidUpdate(prevProps: Props): void {
        if (
            prevProps.lastPost.id !== this.props.lastPost.id &&
            (this.props.lastPost.user_id === this.props.currentUserId || this.state.userScrolledToBottom)
        ) {
            this.scrollToBottom();
        }
    }

    canLoadMorePosts(): void {}

    initScrollToIndex = () => {
        const {highlightedPostId, replyListIds} = this.props;

        if (highlightedPostId) {
            const index = replyListIds.findIndex((item) => item === highlightedPostId);
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

    onScroll = ({scrollHeight, scrollUpdateWasRequested, scrollOffset, clientHeight}: {scrollHeight: number; scrollUpdateWasRequested: boolean; scrollOffset: number; clientHeight: number}): void => {
        if (scrollHeight <= 0 || scrollUpdateWasRequested) {
            return;
        }

        const userScrolledToBottom = scrollHeight - scrollOffset === clientHeight;

        this.setState({
            isScrolling: true,
            userScrolled: true,
            userScrolledToBottom,
        });

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    updateFloatingTimestamp = (visibleTopItem: number): void => {
        if (!this.props.replyListIds) {
            return;
        }

        this.setState({
            topRhsPostId: getLatestPostId(this.props.replyListIds.slice(visibleTopItem)),
        });
    }

    onItemsRendered = ({visibleStartIndex}: {visibleStartIndex: number}): void => {
        this.updateFloatingTimestamp(visibleStartIndex);
    }

    shouldScrollToBottom = (): boolean => {
        return this.getInitialPostIndex() === 0;
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

    scrollToItem = (index: number, position: string, offset?: number): void => {
        if (this.listRef.current) {
            this.listRef.current.scrollToItem(index, position, offset);
        }
    }

    scrollToBottom = (): void => {
        if (this.shouldScrollToBottom()) {
            this.scrollToItem(0, 'end');
        }
    }

    scrollToNewMessage = (): void => {
        this.scrollToItem(getNewMessageIndex(this.props.replyListIds), 'start', OFFSET_TO_SHOW_TOAST);
    }

    handleScrollStop = () => {
        this.setState({isScrolling: false});
    }

    renderRow = memoize(({data, itemId, style}: {data: any; itemId: any; style: any}) => {
        const index = data.indexOf(itemId);
        let className = '';
        let a11Index = 0;
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

        if (!isDateLine(itemId) && !isStartOfNewMessages(itemId)) {
            a11Index++;
        }

        // Since the first in the list is the latest message
        const isLastPost = itemId === getLatestPostId(this.props.replyListIds);
        const isFirstPost = itemId === this.props.replyListIds[this.props.replyListIds.length - (this.props.useRelativeTimestamp ? 1 : 2)];

        return (
            <div
                style={style}
                className={className}
            >
                <Row
                    currentUserId={this.props.currentUserId}
                    a11Index={a11Index}
                    isFirstPost={isFirstPost}
                    isLastPost={isLastPost}
                    listId={itemId}
                    onCardClick={this.props.onCardClick}
                    onCardClickPost={this.props.onCardClickPost}
                    previewCollapsed={this.props.previewCollapsed}
                    previewEnabled={this.props.previewEnabled}
                    previousPostId={getPreviousPostId(data, index)}
                    teamId={this.props.teamId}
                    timestampProps={this.props.useRelativeTimestamp ? THREADING_TIME : undefined}
                />
                {isLastPost && (
                    <CreateComment
                        blockFocus={!this.shouldScrollToBottom()}
                        channelId={this.props.channel.id}
                        isFakeDeletedPost={this.props.selected.type === Constants.PostTypes.FAKE_PARENT_DELETED}
                        channelIsArchived={this.props.channel.delete_at !== 0}
                        isDeleted={(this.props.selected as Post).state === Posts.POST_DELETED}
                        threadId={this.props.selected.id}
                        onHeightChange={this.scrollToBottom}
                        channelType={this.props.channel.type}
                        teammate={this.props.directTeammate}
                        ref={this.postCreateContainerRef}
                    />
                )}
            </div>
        );
    });

    render() {
        return (
            <>
                {this.state.topRhsPostId && !this.props.useRelativeTimestamp && (
                    <FloatingTimestamp
                        isScrolling={this.state.isScrolling}
                        isMobile={Utils.isMobile()}
                        isRhsPost={true}
                        postId={this.state.topRhsPostId}
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
                                correctScrollToBottom={true}
                                height={height}
                                initRangeToRender={this.initRangeToRender}
                                initScrollToIndex={this.initScrollToIndex}
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
