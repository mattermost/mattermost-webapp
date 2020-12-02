// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Channel} from 'mattermost-redux/types/channels';
import {ExtendedPost} from 'mattermost-redux/actions/posts';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import * as Utils from 'utils/utils.jsx';
import {FakePost} from 'types/store/rhs';
import ThreadViewer from 'components/threading/global_threads/thread_viewer';

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
    public static getDerivedStateFromProps(props: Props, state: State) {
        let updatedState: Partial<State> = {selected: props.selected};
        if (state.selected && props.selected && state.selected.id !== props.selected.id) {
            updatedState = {...updatedState, openTime: (new Date()).getTime()};
        }
        return updatedState;
    }

    public constructor(props: Props) {
        super(props);

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
    }

    public render(): JSX.Element {
        if (this.props.posts == null || this.props.selected == null || !this.props.channel) {
            return (
                <div/>
            );
        }

        const {selected, currentUserId} = this.props;

        return (
            <ThreadViewer
                id='rhsContainer'
                className='sidebar-right__body'
                currentUserId={currentUserId}
                rootPostId={selected.id}
                useRelativeTimestamp={true}
            />
        );
    }
}
