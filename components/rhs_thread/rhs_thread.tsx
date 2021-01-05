// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';

import {FakePost} from 'types/store/rhs';

import RhsHeaderPost from 'components/rhs_header_post';
import ThreadViewer from 'components/threading/global_threads/thread_viewer';

type Props = {
    posts: Post[];
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: string;
    currentUserId: string;
}

const RhsThread = ({
    selected,
    posts,
    channel,
    currentUserId,
    previousRhsState,
}: Props) => {
    if (posts == null || selected == null || !channel) {
        return (
            <div/>
        );
    }

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <RhsHeaderPost
                rootPostId={selected.id}
                channel={channel}
                previousRhsState={previousRhsState}
            />
            <ThreadViewer
                currentUserId={currentUserId}
                rootPostId={selected.id}
                useRelativeTimestamp={false}
            />
        </div>
    );
};

export default memo(RhsThread);

