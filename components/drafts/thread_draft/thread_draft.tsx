// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {getPost} from 'mattermost-redux/actions/posts';
import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread, UserThreadSynthetic} from 'mattermost-redux/types/threads';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {PostDraft} from 'types/store/rhs';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import Body from '../panel/panel_body';

type Props = {
    channel: Channel;
    displayName: string;
    draftId: string;
    id: $ID<UserThread | UserThreadSynthetic>;
    status: UserStatus;
    thread: UserThread | UserThreadSynthetic;
    timestamp: Date;
    type: 'channel' | 'thread';
    user: UserProfile;
    value: PostDraft;
}

function ThreadDraft({
    channel,
    displayName,
    draftId,
    id,
    status,
    thread,
    type,
    user,
    value,
}: Props) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!thread?.id) {
            dispatch(getPost(id));
        }
    }, [thread?.id]);

    if (!thread) {
        return null;
    }

    return (
        <Panel>
            {({hover}) => (
                <>
                    <Header
                        hover={hover}
                        actions={(
                            <DraftActions
                                channel={channel}
                                channelName={channel.display_name || displayName}
                                draftId={draftId}
                                id={id}
                                type={type}
                                value={value}
                                thread={thread}
                            />
                        )}
                        title={(
                            <DraftTitle
                                type={type}
                                channel={channel}
                                userId={user.id}
                            />
                        )}
                        timestamp={value.createAt}
                        user={user}
                    />
                    <Body
                        channelId={channel.id}
                        displayName={displayName}
                        draftId={draftId}
                        fileInfos={value.fileInfos}
                        message={value.message}
                        status={status}
                        uploadsInProgress={value.uploadsInProgress}
                        user={user}
                    />
                </>
            )}
        </Panel>
    );
}

export default memo(ThreadDraft);
