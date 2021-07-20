// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React, {HTMLAttributes} from 'react';
import Scrollbars from 'react-custom-scrollbars';
import classNames from 'classnames';

import {Posts} from 'mattermost-redux/constants';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {ExtendedPost} from 'mattermost-redux/actions/posts';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';
import {UserThread} from 'mattermost-redux/types/threads';
import {isFromWebhook} from 'mattermost-redux/utils/post_utils';

import Constants from 'utils/constants';
import DelayedAction from 'utils/delayed_action';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent';
import CreateComment from 'components/create_comment';
import LoadingScreen from 'components/loading_screen';
import DateSeparator from 'components/post_view/date_separator';
import FloatingTimestamp from 'components/post_view/floating_timestamp';
import NewMessageSeparator from 'components/post_view/new_message_separator/new_message_separator';
import RhsComment from 'components/rhs_comment';
import RhsRootPost from 'components/rhs_root_post';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {FakePost} from 'types/store/rhs';
import {THREADING_TIME as BASE_THREADING_TIME} from 'components/threading/common/options';

import './thread_viewer.scss';

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
export function renderView(props: Record<string, any>) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />
    );
}

export function renderThumbHorizontal() {
    return (
        <div/>
    );
}

export function renderThumbVertical(props: Record<string, any>) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />
    );
}

type Attrs = Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'id'>;

type Props = Attrs & {
    isCollapsedThreadsEnabled: boolean;
    userThread?: UserThread | null;
    posts: Post[];
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: string;
    currentUserId: string;
    currentTeamId: string;
    previewCollapsed: string;
    previewEnabled: boolean;
    socketConnectionStatus: boolean;
    actions: {
        removePost: (post: ExtendedPost) => void;
        selectPostCard: (post: Post) => void;
        getPostThread: (rootId: string, root?: boolean) => Promise<any>|ActionFunc;
        getThread: (userId: string, teamId: string, threadId: string, extended: boolean) => Promise<any>|ActionFunc;
        updateThreadRead: (userId: string, teamId: string, threadId: string, timestamp: number) => unknown;
        updateThreadLastOpened: (threadId: string, lastViewedAt: number) => unknown;
    };
    directTeammate?: UserProfile;
    useRelativeTimestamp?: boolean;
    highlightedPostId?: string;
    lastViewedAt?: number;
};

type State = {
    selected?: Post | FakePost;
    windowWidth?: number;
    windowHeight?: number;
    isScrolling: boolean;
    isLoading: boolean;
    topRhsPostId: string;
    openTime: number;
    postsArray?: Array<Post | FakePost>;
    isBusy?: boolean;
    postsContainerHeight: number;
    userScrolledToBottom: boolean;
}

export default class ThreadViewer extends React.Component<Props, State> {
    private scrollStopAction: DelayedAction;
    private rhspostlistRef: React.RefObject<HTMLDivElement>;
    private containerRef: React.RefObject<HTMLDivElement>;
    private postCreateContainerRef: React.RefObject<HTMLDivElement>;
    private scrollbarsRef: React.RefObject<Scrollbars>;
    private newMessagesRef: React.RefObject<HTMLDivElement>;

    public static getDerivedStateFromProps(props: Props, state: State) {
        let updatedState: Partial<State> = {selected: props.selected};
        if (state.selected && props.selected && state.selected.id !== props.selected.id) {
            updatedState = {...updatedState, openTime: (new Date()).getTime()};
        }
        return updatedState;
    }

    public constructor(props: Props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        const openTime = (new Date()).getTime();

        this.state = {
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
            isScrolling: false,
            topRhsPostId: '',
            openTime,
            postsContainerHeight: 0,
            userScrolledToBottom: false,
            isLoading: false,
        };

        this.rhspostlistRef = React.createRef();
        this.containerRef = React.createRef();
        this.postCreateContainerRef = React.createRef();
        this.scrollbarsRef = React.createRef();
        this.newMessagesRef = React.createRef();
    }

    private getLastPost() {
        const childPosts = this.rhspostlistRef.current?.children;
        return childPosts && childPosts[childPosts.length - 1];
    }

    private resizeRhsPostList() {
        const containerHeight = this.containerRef.current?.getBoundingClientRect().height;
        const createContainerHeight = this.postCreateContainerRef.current?.getBoundingClientRect().height;
        const headerHeight = 56;
        if (containerHeight && createContainerHeight) {
            this.setState({
                postsContainerHeight: containerHeight - (createContainerHeight + headerHeight),
            });
        }
    }

    public componentDidMount() {
        this.resizeRhsPostList();
        window.addEventListener('resize', this.handleResize);

        if (this.props.isCollapsedThreadsEnabled && this.props.userThread !== null) {
            this.markThreadRead();
        }

        this.onInit();
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    public morePostsToFetch(): boolean {
        const rootPost = Utils.getRootPost(this.props.posts);
        const replyCount = this.getReplyCount();
        return rootPost && this.props.posts.length < (replyCount + 1);
    }

    public getReplyCount() {
        return Utils.getRootPost(this.props.posts)?.reply_count || this.props.userThread?.reply_count || 0;
    }

    fetchThread() {
        const {
            actions: {
                getThread,
            },
            currentUserId,
            currentTeamId,
            selected,
        } = this.props;

        if (this.getReplyCount() && Utils.getRootPost(this.props.posts)?.is_following) {
            return getThread(
                currentUserId,
                currentTeamId,
                selected.id,
                true,
            );
        }

        return Promise.resolve({data: true});
    }

    markThreadRead() {
        if (this.props.userThread) {
            // update last viewed at for thread before marking as read.
            this.props.actions.updateThreadLastOpened(
                this.props.userThread.id,
                this.props.userThread.last_viewed_at,
            );

            if (
                this.props.userThread.last_viewed_at < this.props.userThread.last_reply_at ||
                this.props.userThread.unread_mentions ||
                this.props.userThread.unread_replies
            ) {
                this.props.actions.updateThreadRead(
                    this.props.currentUserId,
                    this.props.currentTeamId,
                    this.props.selected.id,
                    Date.now(),
                );
            }
        }
    }

    public componentDidUpdate(prevProps: Props) {
        const prevPostsArray = prevProps.posts || [];
        const curPostsArray = this.props.posts || [];

        const reconnected = this.props.socketConnectionStatus && !prevProps.socketConnectionStatus;
        const selectedChanged = this.props.selected.id !== prevProps.selected.id;

        if (reconnected || selectedChanged) {
            this.onInit(reconnected);
        }

        if (
            this.props.isCollapsedThreadsEnabled &&
            this.props.userThread?.id !== prevProps.userThread?.id
        ) {
            this.markThreadRead();
        }

        if (prevPostsArray.length >= curPostsArray.length) {
            return;
        }

        const curLastPost = curPostsArray[0];

        if (
            !reconnected &&
            !selectedChanged &&
            !this.shouldBlockBottomScroll() &&
            (curLastPost.user_id === this.props.currentUserId || this.state.userScrolledToBottom)
        ) {
            this.scrollToBottom();
        }
    }

    public shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!Utils.areObjectsEqual(nextState.postsArray, this.props.posts)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.selected, this.props.selected)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextProps.userThread, this.props.userThread)) {
            return true;
        }

        if (nextProps.previewEnabled !== this.props.previewEnabled) {
            return true;
        }

        if (nextState.isBusy !== this.state.isBusy) {
            return true;
        }

        if (nextState.isScrolling !== this.state.isScrolling) {
            return true;
        }

        if (nextState.topRhsPostId !== this.state.topRhsPostId) {
            return true;
        }

        if (nextProps.highlightedPostId !== this.props.highlightedPostId) {
            return true;
        }

        return false;
    }

    // called either after mount, socket reconnected, or selected thread changed
    // fetches the thread/posts if needed and
    // scrolls to either bottom or new messages line
    private onInit = async (reconnected = false): Promise<void> => {
        if (reconnected || this.morePostsToFetch()) {
            this.setState({isLoading: !reconnected});
            await this.props.actions.getPostThread(this.props.selected.id, !reconnected);
        }

        if (
            this.props.isCollapsedThreadsEnabled &&
            this.props.userThread == null
        ) {
            this.setState({isLoading: !reconnected});
            await this.fetchThread();
        }

        this.setState({isLoading: false}, () => {
            if (
                !reconnected &&
                this.newMessagesRef.current &&
                !this.isInViewport(this.newMessagesRef.current)
            ) {
                this.newMessagesRef.current.scrollIntoView();
            } else if (
                !reconnected &&
                !this.props.highlightedPostId
            ) {
                this.scrollToBottom();
            }
        });
    }

    shouldBlockBottomScroll = (): boolean => {
        // in the case of highlighted reply, and
        // in the case of new messages line
        // we should not scrollToBottom.
        return Boolean(this.props.highlightedPostId || this.newMessagesRef.current);
    }

    isInViewport = (element: HTMLDivElement): boolean => {
        const containerHeight = this.containerRef.current?.getBoundingClientRect().height;

        if (!containerHeight) {
            return false;
        }

        const rect = element.getBoundingClientRect();

        const height = window.innerHeight || document.documentElement.clientHeight;

        return (
            rect.top > height - containerHeight &&
            rect.bottom < (window.innerHeight || document.documentElement.clientHeight)
        );
    }

    private handleResize = (): void => {
        this.setState({
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
        });

        if (!this.shouldBlockBottomScroll() && UserAgent.isMobile() && document!.activeElement!.id === 'reply_textbox') {
            this.scrollToBottom();
        }
        this.resizeRhsPostList();
    }

    private handleCardClick = (post: Post) => {
        if (!post) {
            return;
        }

        this.props.actions.selectPostCard(post);
    }

    private handleCardClickPost = (post: Post) => {
        if (!post) {
            return;
        }

        this.props.actions.selectPostCard(post);
    }

    private filterPosts = (posts: Post[], selected: Post | FakePost, openTime: number): Post[] => {
        const postsArray: Post[] = [];

        posts.forEach((cpost) => {
            // Do not show empherals created before sidebar has been opened
            if (cpost.type === 'system_ephemeral' && cpost.create_at < openTime) {
                return;
            }

            if (cpost.root_id === selected.id) {
                postsArray.unshift(cpost);
            }
        });

        return postsArray;
    }

    public scrollToBottom = (): void => {
        this.scrollbarsRef.current?.scrollToBottom();
    }

    private updateFloatingTimestamp = (): void => {
        // skip this in non-mobile view since that's when the timestamp is visible
        if (!Utils.isMobile()) {
            return;
        }

        if (this.props.posts) {
            const childNodes = (this.rhspostlistRef.current as HTMLElement).childNodes;
            const viewPort = (this.rhspostlistRef.current as HTMLElement).getBoundingClientRect();
            let topRhsPostId = '';
            const offset = 100;

            // determine the top rhs comment assuming that childNodes and postsArray are of same length
            for (let i = 0; i < childNodes.length; i++) {
                if (((childNodes[i] as HTMLElement).offsetTop + viewPort.top) - offset > 0) {
                    topRhsPostId = this.props.posts[i].id;
                    break;
                }
            }

            if (topRhsPostId !== this.state.topRhsPostId) {
                this.setState({
                    topRhsPostId,
                });
            }
        }
    }

    private handleScroll = (event: React.UIEvent<any>): void => {
        this.updateFloatingTimestamp();
        const typeCastedEventTarget = (event.target as HTMLDivElement);
        const maxScroll = typeCastedEventTarget.scrollHeight - typeCastedEventTarget.getBoundingClientRect().height;
        const scrollTop = typeCastedEventTarget.scrollTop;
        const lastPost = this.getLastPost()?.getBoundingClientRect();

        if (!this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            });
        }

        if (lastPost) {
            const userScrolledToBottom = scrollTop >= maxScroll - lastPost.height;

            this.setState({userScrolledToBottom});
        }

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    private handleScrollStop = (): void => {
        this.setState({
            isScrolling: false,
        });
    }

    private handlePostCommentResize = (): void => {
        this.resizeRhsPostList();
        if (!this.shouldBlockBottomScroll()) {
            this.scrollToBottom();
        }
    }

    public render(): JSX.Element {
        if (this.props.posts == null || this.props.selected == null || !this.props.channel) {
            return (
                <span/>
            );
        }

        const postsArray = this.filterPosts(this.props.posts, this.props.selected, this.state.openTime);
        const postsLength = postsArray.length;
        const {selected, currentUserId} = this.props;

        let isRhsRootLastPost = false;
        let lastRhsCommentPost: Partial<Post> = {};

        if (postsLength === 0) {
            isRhsRootLastPost = true;
        } else {
            lastRhsCommentPost = postsArray[postsLength - 1];
        }

        let createAt = (selected as Post).create_at;
        if (!createAt && this.props.posts.length > 0) {
            createAt = this.props.posts[this.props.posts.length - 1].create_at;
        }
        const rootPostDay = Utils.getDateForUnixTicks(createAt);
        let previousPostDay = rootPostDay;

        const items = [];
        let a11yIndex = 1;
        let addedNewMessagesIndicator = false;
        for (let i = 0; i < postsLength; i++) {
            const comPost = postsArray[i];
            const previousPostId = i > 0 ? postsArray[i - 1].id : '';

            if (!this.props.useRelativeTimestamp) {
                const currentPostDay = Utils.getDateForUnixTicks(comPost.create_at);
                if (currentPostDay.toDateString() !== previousPostDay.toDateString()) {
                    previousPostDay = currentPostDay;
                    items.push(
                        <DateSeparator
                            key={currentPostDay.toString()}
                            date={currentPostDay}
                        />);
                }
            }

            if (
                this.props.isCollapsedThreadsEnabled &&
                !addedNewMessagesIndicator &&
                typeof this.props.lastViewedAt === 'number' &&
                comPost.id &&
                comPost.create_at >= this.props.lastViewedAt &&
                (currentUserId !== comPost.user_id || isFromWebhook(comPost))
            ) {
                addedNewMessagesIndicator = true;
                items.push(
                    <NewMessageSeparator
                        wrapperRef={this.newMessagesRef}
                        key={`thread-new-messages-${comPost.id}`}
                        separatorId={`thread-new-messages-${comPost.id}`}
                    />,
                );
            }

            const isFocused = comPost.id && comPost.id === this.props.highlightedPostId;
            const keyPrefix = comPost.id ? comPost.id : comPost.pending_post_id;

            items.push(
                <RhsComment
                    key={keyPrefix + 'commentKey'}
                    post={comPost}
                    previousPostId={previousPostId}
                    teamId={this.props.channel!.team_id}
                    currentUserId={currentUserId}
                    isBusy={this.state.isBusy}
                    isFocused={isFocused}
                    removePost={this.props.actions.removePost}
                    previewCollapsed={this.props.previewCollapsed}
                    previewEnabled={this.props.previewEnabled}
                    handleCardClick={this.handleCardClickPost}
                    a11yIndex={a11yIndex++}
                    isLastPost={comPost.id === lastRhsCommentPost.id}
                    timestampProps={this.props.useRelativeTimestamp ? THREADING_TIME : undefined}
                    isInViewport={this.isInViewport}
                />,
            );
        }

        let createComment;
        const isFakeDeletedPost = selected.type === Constants.PostTypes.FAKE_PARENT_DELETED;
        const channelIsArchived = this.props.channel!.delete_at !== 0;
        if (!isFakeDeletedPost) {
            if (channelIsArchived) {
                createComment = (
                    <div className='channel-archived-warning'>
                        <FormattedMarkdownMessage
                            id='archivedChannelMessage'
                            defaultMessage='You are viewing an **archived channel**. New messages cannot be posted.'
                        />
                    </div>
                );
            } else {
                createComment = (
                    <div
                        className='post-create__container'
                        ref={this.postCreateContainerRef}
                    >
                        <CreateComment
                            scrollToBottom={this.scrollToBottom}
                            onHeightChange={this.handlePostCommentResize}
                            channelId={selected.channel_id}
                            rootId={selected.id}
                            rootDeleted={(selected as Post).state === Posts.POST_DELETED}
                            latestPostId={postsLength > 0 ? postsArray[postsLength - 1].id : selected.id}
                        />
                    </div>
                );
            }
        }

        if (this.props.channel!.type === Constants.DM_CHANNEL) {
            const teammate = this.props.directTeammate;
            if (teammate && teammate.delete_at) {
                createComment = (
                    <div
                        className='post-create-message'
                    >
                        <FormattedMarkdownMessage
                            id='create_post.deactivated'
                            defaultMessage='You are viewing an archived channel with a **deactivated user**. New messages cannot be posted.'
                        />
                    </div>
                );
            }
        }

        if (this.state.isLoading) {
            return <LoadingScreen style={{height: '100%'}}/>;
        }

        return (
            <>
                <div
                    className={classNames('ThreadViewer', this.props.className)}
                    ref={this.containerRef}
                >
                    {!this.props.useRelativeTimestamp && (
                        <FloatingTimestamp
                            isScrolling={this.state.isScrolling}
                            isMobile={Utils.isMobile()}
                            postId={this.state.topRhsPostId}
                            isRhsPost={true}
                        />
                    )}
                    <Scrollbars
                        ref={this.scrollbarsRef}
                        autoHide={true}
                        autoHideTimeout={500}
                        autoHideDuration={500}
                        renderThumbHorizontal={renderThumbHorizontal}
                        renderThumbVertical={renderThumbVertical}
                        autoHeightMax={this.state.postsContainerHeight}
                        renderView={renderView}
                        onScroll={this.handleScroll}
                    >
                        <div className='post-right__scroll'>
                            <div
                                role='application'
                                aria-label={Utils.localizeMessage('accessibility.sections.rhsContent', 'message details complimentary region')}
                                className='post-right__content a11y__region'
                                data-a11y-sort-order='3'
                                data-a11y-focus-child={true}
                                data-a11y-order-reversed={true}
                            >
                                {!this.props.useRelativeTimestamp && !isFakeDeletedPost && <DateSeparator date={rootPostDay}/>}
                                <RhsRootPost
                                    post={selected}
                                    commentCount={postsLength}
                                    teamId={this.props.channel!.team_id}
                                    currentUserId={this.props.currentUserId}
                                    previewCollapsed={this.props.previewCollapsed}
                                    previewEnabled={this.props.previewEnabled}
                                    isBusy={this.state.isBusy}
                                    handleCardClick={this.handleCardClick}
                                    isLastPost={isRhsRootLastPost}
                                    timestampProps={this.props.useRelativeTimestamp ? THREADING_TIME : undefined}
                                />
                                {!this.props.useRelativeTimestamp && isFakeDeletedPost && rootPostDay && <DateSeparator date={rootPostDay}/>}
                                <div
                                    ref={this.rhspostlistRef}
                                    className='post-right-comments-container'
                                >
                                    {items}
                                </div>
                            </div>
                            {createComment}
                        </div>
                    </Scrollbars>
                </div>
            </>
        );
    }
}
