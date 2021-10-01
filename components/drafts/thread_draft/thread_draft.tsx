// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useMemo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {getPost} from 'mattermost-redux/actions/posts';
import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread, UserThreadSynthetic} from 'mattermost-redux/types/threads';
import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {selectPost} from 'actions/views/rhs';
import {removeDraft} from 'actions/views/drafts';
import {makeOnSubmit} from 'actions/views/create_comment';

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
    status: UserStatus['status'];
    thread?: UserThread | UserThreadSynthetic;
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

    const onSubmit = useMemo(() => {
        if (thread) {
            return makeOnSubmit(channel.id, thread.id, '');
        }

        return () => Promise.resolve({data: true});
    }, [channel.id, thread?.id]);

    const handleOnDelete = useCallback((id: string) => {
        dispatch(removeDraft(id));
    }, [id]);

    const handleOnEdit = useCallback(() => {
        dispatch(selectPost({id, channel_id: channel.id} as Post));
    }, [channel]);

    const handleOnSend = useCallback(async (id: string) => {
        await dispatch(onSubmit(value));

        handleOnDelete(id);
        handleOnEdit();
    }, [value, onSubmit]);

    if (!thread) {
        return null;
    }

    return (
        <Panel onClick={handleOnEdit}>
            {({hover}) => (
                <>
                    <Header
                        hover={hover}
                        actions={(
                            <DraftActions
                                channelDisplayName={channel.display_name}
                                channelName={channel.name}
                                channelType={channel.type}
                                userId={user.id}
                                draftId={draftId}
                                onDelete={handleOnDelete}
                                onEdit={handleOnEdit}
                                onSend={handleOnSend}
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
                    />
                    <Body
                        channelId={channel.id}
                        displayName={displayName}
                        fileInfos={value.fileInfos}
                        message={value.message}
                        status={status}
                        uploadsInProgress={value.uploadsInProgress}
                        userId={user.id}
                        username={user.username}
                    />
                </>
            )}
        </Panel>
    );
}

export default memo(ThreadDraft);
