// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useMemo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {getChannel} from 'mattermost-redux/actions/channels';
import {getPost} from 'mattermost-redux/actions/posts';
import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread, UserThreadSynthetic} from 'mattermost-redux/types/threads';
import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {selectPost} from 'actions/views/rhs';
import {makeOnSubmit} from 'actions/views/create_comment';
import {setGlobalItem} from 'actions/storage';

import {PostDraft} from 'types/store/rhs';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import Body from '../panel/panel_body';

type Props = {
    channel?: Channel;
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

    useEffect(() => {
        if (!channel?.id) {
            dispatch(getChannel(id));
        }
    }, [channel?.id]);

    const onSubmit = useMemo(() => {
        if (channel && thread) {
            return makeOnSubmit(channel.id, thread.id, '');
        }

        return () => Promise.resolve({data: true});
    }, [channel?.id, thread?.id]);

    const handleSubmit = async () => {
        await dispatch(onSubmit(value));
        return {data: true};
    };

    const handleOnDelete = useCallback((id: string) => {
        localStorage.removeItem(id);
        dispatch(setGlobalItem(id, {message: '', fileInfos: [], uploadsInProgress: []}));
    }, [id]);

    const handleOnEdit = useCallback(() => {
        if (channel) {
            dispatch(selectPost({id, channel_id: channel.id} as Post));
        }
    }, [channel]);

    const handleOnSend = useCallback((id: string) => {
        if (!thread || !channel) {
            return;
        }

        handleSubmit().then(() => {
            handleOnDelete(id);
            handleOnEdit();
        });
    }, [thread, channel]);

    if (!thread || !channel) {
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
                                channelName={channel.display_name || displayName}
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
