// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {FakePost, RhsState} from 'types/store/rhs';

import RhsHeaderPost from 'components/rhs_header_post';
import ThreadViewer from 'components/threading/thread_viewer';
import {closeRightHandSide} from 'actions/views/rhs';

type Props = {
    posts: Post[];
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: RhsState;
}

const RhsThread = ({
    selected,
    posts,
    channel,
    previousRhsState,
}: Props) => {
    const dispatch = useDispatch();
    const currentTeam = useSelector(getCurrentTeam);

    useEffect(() => {
        if (currentTeam.id !== channel?.team_id) {
            dispatch(closeRightHandSide());
        }
    }, [currentTeam, channel]);

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

