// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
/* eslint-disable react/no-string-refs */

import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';

import {FakePost} from 'types/store/rhs';

import RhsHeaderPost from 'components/rhs_header_post';
import ThreadViewer from 'components/threading/thread_viewer';

type Props = {
    posts: Post[];
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: string;
}

const RhsThread = ({
    selected,
    posts,
    channel,
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
                rootPostId={selected.id}
                useRelativeTimestamp={false}
                isThreadView={false}
            />
        </div>
    );
};

export default memo(RhsThread);

