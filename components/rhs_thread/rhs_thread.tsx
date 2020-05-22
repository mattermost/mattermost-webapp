// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FormattedMessage} from 'react-intl';
import React from 'react';
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

import './rhs_thread.scss';

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
    selectedPostFocusedAt?: number;
}

type State = {
    selected?: Record<string, any>;
    windowWidth?: number;
    windowHeight?: number;
    isScrolling: boolean;
    isAtBottom: boolean;
    topRhsPostId: string;
    openTime: number;
    postsArray?: Record<string, any>[];
    isBusy?: boolean;
}

export default class RhsThread extends React.Component<Props, State> {
    private scrollStopAction: DelayedAction;
    private scrollbarsRef: React.RefObject<HTMLDivElement>;
    private rhspostlistRef: React.RefObject<HTMLDivElement>;

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
            isAtBottom: true,
            topRhsPostId: '',
            openTime,
        };

        this.scrollbarsRef = React.createRef<HTMLDivElement>();
        this.rhspostlistRef = React.createRef<HTMLDivElement>();
    }

    public componentDidMount() {
        this.scrollToBottom();
        window.addEventListener('resize', this.handleResize);
        if (this.props.posts.length < (Utils.getRootPost(this.props.posts).reply_count + 1)) {
            this.props.actions.getPostThread(this.props.selected.id, true);
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    public componentDidUpdate(prevProps: Props, prevState: State, snapshot?: any) {
        const prevPostsArray = prevProps.posts || [];
        const curPostsArray = this.props.posts || [];

        // scroll to bottom if this post is re-focused
        // ex. clicking on reply in center channel
        if (this.props.selectedPostFocusedAt && prevProps.selectedPostFocusedAt) {
            if (this.props.selectedPostFocusedAt > prevProps.selectedPostFocusedAt) {
                this.scrollToBottom();
            }
        }

        if (this.props.socketConnectionStatus && !prevProps.socketConnectionStatus) {
            this.props.actions.getPostThread(this.props.selected.id);
        }

        // if snapshot value, new posts have been added
        // if at bottom of thread, continue to scroll after adding new post
        if (curPostsArray.length > prevPostsArray.length) {
            if (snapshot) {
                this.scrollToBottom();
            }
        }

        if (prevPostsArray.length >= curPostsArray.length) {
            return;
        }

        const curLastPost = curPostsArray[0];

        if (curLastPost.user_id === this.props.currentUserId) {
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

        if (nextProps.selectedPostFocusedAt && this.props.selectedPostFocusedAt) {
            if (nextProps.selectedPostFocusedAt > this.props.selectedPostFocusedAt) {
                return true;
            }
        }

        return false;
    }

    public getSnapshotBeforeUpdate(prevProps: Props, prevState: State) {
        // if adding posts to thread, capture state of rhs to determine if scrolled to botttom
        if (!Utils.areObjectsEqual(prevState.postsArray, this.props.posts)) {
            return prevState.isAtBottom;
        }
        return null;
    }

    private handleResize = (): void => {
        this.setState({
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
        });

        if (UserAgent.isMobile() && document!.activeElement!.id === 'reply_textbox') {
            this.scrollToBottom();
        }
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

    scrollToBottom = () => {
        if (this.scrollbarsRef.current) {
            const elem = this.scrollbarsRef.current;
            elem.scrollTop = elem.scrollHeight - elem.clientHeight;
        }
    }

    private updateFloatingTimestamp = (): void => {
        // skip this in non-mobile view since that's when the timestamp is visible
        if (!Utils.isMobile()) {
            return;
        }

        if (this.props.posts && this.rhspostlistRef.current) {
            const childNodes = this.rhspostlistRef.current.childNodes;
            const viewPort = this.rhspostlistRef.current.getBoundingClientRect();
            const offset = 100;
            let topRhsPostId = '';

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

    private handleScroll = (): void => {
        this.updateFloatingTimestamp();

        if (!this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            });
        }

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    private handleScrollStop = (): void => {
        this.setState({
            isScrolling: false,
        });

        if (this.scrollbarsRef.current) {
            const elem = this.scrollbarsRef.current;
            const isAtBottom = elem.scrollTop + elem.clientHeight === elem.scrollHeight;
            this.setState({
                isAtBottom,
            });
        }
    }

    public render(): JSX.Element {
        if (this.props.posts == null || this.props.selected == null) {
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
                    <div className='post-create__container'>
                        <CreateComment
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
                        <FormattedMessage
                            id='create_post.deactivated'
                            defaultMessage='You are viewing an archived channel with a deactivated user.'
                        />
                    </div>
                );
            }
        }

        return (
            <div
                id='rhsContainer'
                className='sidebar-right__body'
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
                <div
                    className={'RhsThread__scrollbars'}
                    ref={this.scrollbarsRef}
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
                    </div>
                </div>
                {createComment}
            </div>
        );
    }
}
