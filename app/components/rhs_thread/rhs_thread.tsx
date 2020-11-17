// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import $ from 'jquery';
import React, {UIEvent} from 'react';
import Scrollbars from 'react-custom-scrollbars';
import {Posts} from 'mattermost-redux/constants';
import {Channel} from 'mattermost-redux/types/channels';
import {ExtendedPost} from 'mattermost-redux/actions/posts';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import Constants from 'utils/constants';
import DelayedAction from 'utils/delayed_action';
import * as Utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent';
import CreateComment from 'components/create_comment';
import DateSeparator from 'components/post_view/date_separator';
import FloatingTimestamp from 'components/post_view/floating_timestamp';
import RhsComment from 'components/rhs_comment';
import RhsHeaderPost from 'components/rhs_header_post';
import RhsRootPost from 'components/rhs_root_post';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {FakePost} from 'types/store/rhs';

export function renderView(props: Record<string, any>) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal() {
    return (<div/>);
}

export function renderThumbVertical(props: Record<string, any>) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

type Props = {
    posts: Post[];
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: string;
    currentUserId: string;
    previewCollapsed: string;
    previewEnabled: boolean;
    socketConnectionStatus: boolean;
    actions: {
        removePost: (post: ExtendedPost) => void;
        selectPostCard: (post: Post) => void;
        getPostThread: (rootId: string, root?: boolean) => void;
    };
    directTeammate: UserProfile;
}

type State = {
    selected?: Record<string, any>;
    windowWidth?: number;
    windowHeight?: number;
    isScrolling: boolean;
    topRhsPostId: string;
    openTime: number;
    postsArray?: Record<string, any>[];
    isBusy?: boolean;
    postsContainerHeight: number;
    userScrolledToBottom: boolean;
}

export default class RhsThread extends React.Component<Props, State> {
    private scrollStopAction: DelayedAction;
    private rhspostlistRef: React.RefObject<HTMLDivElement>;
    private containerRef: React.RefObject<HTMLDivElement>;
    private postCreateContainerRef : React.RefObject<HTMLDivElement>;

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
        };

        this.rhspostlistRef = React.createRef();
        this.containerRef = React.createRef();
        this.postCreateContainerRef = React.createRef();
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
        this.scrollToBottom();
        this.resizeRhsPostList();
        window.addEventListener('resize', this.handleResize);
        if (this.props.posts.length < (Utils.getRootPost(this.props.posts).reply_count + 1)) {
            this.props.actions.getPostThread(this.props.selected.id, true);
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    public componentDidUpdate(prevProps: Props) {
        const prevPostsArray = prevProps.posts || [];
        const curPostsArray = this.props.posts || [];

        if (this.props.socketConnectionStatus && !prevProps.socketConnectionStatus) {
            this.props.actions.getPostThread(this.props.selected.id);
        }

        if (prevPostsArray.length >= curPostsArray.length) {
            return;
        }

        const curLastPost = curPostsArray[0];

        if (curLastPost.user_id === this.props.currentUserId || this.state.userScrolledToBottom) {
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

        return false;
    }

    private handleResize = (): void => {
        this.setState({
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
        });

        if (UserAgent.isMobile() && document!.activeElement!.id === 'reply_textbox') {
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
        if ($('.post-right__scroll')[0]) {
            $('.post-right__scroll').parent().scrollTop($('.post-right__scroll')[0].scrollHeight); // eslint-disable-line jquery/no-parent
        }
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
        this.scrollToBottom();
    }

    public render(): JSX.Element {
        if (this.props.posts == null || this.props.selected == null || !this.props.channel) {
            return (
                <div/>
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

        const commentsLists = [];
        let a11yIndex = 1;
        for (let i = 0; i < postsLength; i++) {
            const comPost = postsArray[i];
            const previousPostId = i > 0 ? postsArray[i - 1].id : '';

            const currentPostDay = Utils.getDateForUnixTicks(comPost.create_at);
            if (currentPostDay.toDateString() !== previousPostDay.toDateString()) {
                previousPostDay = currentPostDay;
                commentsLists.push(
                    <DateSeparator
                        key={currentPostDay.toString()}
                        date={currentPostDay}
                    />);
            }

            const keyPrefix = comPost.id ? comPost.id : comPost.pending_post_id;

            commentsLists.push(
                <RhsComment
                    key={keyPrefix + 'commentKey'}
                    ref={comPost.id}
                    post={comPost}
                    previousPostId={previousPostId}
                    teamId={this.props.channel!.team_id}
                    currentUserId={currentUserId}
                    isBusy={this.state.isBusy}
                    removePost={this.props.actions.removePost}
                    previewCollapsed={this.props.previewCollapsed}
                    previewEnabled={this.props.previewEnabled}
                    handleCardClick={this.handleCardClickPost}
                    a11yIndex={a11yIndex++}
                    isLastPost={comPost.id === lastRhsCommentPost.id}
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
            const teammate: UserProfile = this.props.directTeammate;
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

        return (
            <div
                id='rhsContainer'
                className='sidebar-right__body'
                ref={this.containerRef}
            >
                <FloatingTimestamp
                    isScrolling={this.state.isScrolling}
                    isMobile={Utils.isMobile()}
                    postId={this.state.topRhsPostId}
                    isRhsPost={true}
                />
                <RhsHeaderPost
                    rootPostId={selected.id}
                    channel={this.props.channel}
                    previousRhsState={this.props.previousRhsState}
                />
                <Scrollbars
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
                            id='rhsContent'
                            aria-label={Utils.localizeMessage('accessibility.sections.rhsContent', 'message details complimentary region')}
                            className='post-right__content a11y__region'
                            data-a11y-sort-order='3'
                            data-a11y-focus-child={true}
                            data-a11y-order-reversed={true}
                        >
                            {!isFakeDeletedPost && <DateSeparator date={rootPostDay}/>}
                            <RhsRootPost
                                ref={selected.id}
                                post={selected}
                                commentCount={postsLength}
                                teamId={this.props.channel!.team_id}
                                currentUserId={this.props.currentUserId}
                                previewCollapsed={this.props.previewCollapsed}
                                previewEnabled={this.props.previewEnabled}
                                isBusy={this.state.isBusy}
                                handleCardClick={this.handleCardClick}
                                isLastPost={isRhsRootLastPost}
                            />
                            {isFakeDeletedPost && rootPostDay && <DateSeparator date={rootPostDay}/>}
                            <div
                                ref={this.rhspostlistRef}
                                className='post-right-comments-container'
                                id='rhsPostList'
                            >
                                {commentsLists}
                            </div>
                        </div>
                        {createComment}
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */
