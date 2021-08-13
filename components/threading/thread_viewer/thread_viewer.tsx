// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React, {HTMLAttributes} from 'react';
import classNames from 'classnames';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {ExtendedPost} from 'mattermost-redux/actions/posts';
import {Post} from 'mattermost-redux/types/posts';
import {UserThread} from 'mattermost-redux/types/threads';
import {$ID} from 'mattermost-redux/types/utilities';

import deferComponentRender from 'components/deferComponentRender';
import LoadingScreen from 'components/loading_screen';
import {FakePost} from 'types/store/rhs';
import ThreadViewerVirtualized from '../virtualized_thread_viewer';

import './thread_viewer.scss';

const DeferredThreadViewerVirt = deferComponentRender(ThreadViewerVirtualized);

type Attrs = Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'id'>;

type Props = Attrs & {
    isCollapsedThreadsEnabled: boolean;
    userThread?: UserThread | null;
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: string;
    currentUserId: string;
    currentTeamId: string;
    socketConnectionStatus: boolean;
    actions: {
        removePost: (post: ExtendedPost) => void;
        selectPostCard: (post: Post) => void;
        getPostThread: (rootId: string, root?: boolean) => Promise<any>|ActionFunc;
        getThread: (userId: string, teamId: string, threadId: string, extended: boolean) => Promise<any>|ActionFunc;
        updateThreadRead: (userId: string, teamId: string, threadId: string, timestamp: number) => unknown;
        updateThreadLastOpened: (threadId: string, lastViewedAt: number) => unknown;
        fetchRHSAppsBindings: (channelId: string, rootID: string) => unknown;
    };
    useRelativeTimestamp?: boolean;
    postIds: string[];
    highlightedPostId?: $ID<Post>;
};

type State = {
    isLoading: boolean;
}

export default class ThreadViewer extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: false,
        };
    }

    public componentDidMount() {
        if (this.props.isCollapsedThreadsEnabled && this.props.userThread !== null) {
            this.markThreadRead();
        }

        this.onInit();

        this.props.actions.fetchRHSAppsBindings(this.props.channel?.id || '', this.props.selected.id);
    }

    public componentDidUpdate(prevProps: Props) {
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

        if (this.props.channel?.id !== prevProps.channel?.id ||
            this.props.selected.id !== prevProps.selected.id) {
            this.props.actions.fetchRHSAppsBindings(this.props.channel?.id || '', this.props.selected.id);
        }
    }

    public morePostsToFetch(): boolean {
        const replyCount = this.getReplyCount();
        return this.props.selected && this.props.postIds.length < (replyCount + 1);
    }

    public getReplyCount(): number {
        return (this.props.selected as Post)?.reply_count || this.props.userThread?.reply_count || 0;
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

        if (selected && this.getReplyCount() && (this.props.selected as Post)?.is_following) {
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

        this.setState({isLoading: false});
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

    public render(): JSX.Element {
        if (this.props.postIds == null || this.props.selected == null || !this.props.channel) {
            return (
                <span/>
            );
        }

        if (this.state.isLoading) {
            return (
                <LoadingScreen
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        flex: '1',
                    }}
                />
            );
        }

        return (
            <>
                <div className={classNames('ThreadViewer', this.props.className)}>
                    <div className='post-right-comments-container'>
                        {this.props.selected && (
                            <DeferredThreadViewerVirt
                                key={this.props.selected.id}
                                channel={this.props.channel}
                                onCardClick={this.handleCardClick}
                                onCardClickPost={this.handleCardClickPost}
                                postIds={this.props.postIds}
                                removePost={this.props.actions.removePost}
                                selected={this.props.selected}
                                useRelativeTimestamp={this.props.useRelativeTimestamp || false}
                                highlightedPostId={this.props.highlightedPostId}
                            />
                        )}
                    </div>
                </div>
            </>
        );
    }
}
