// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo, useCallback, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {UserThread, UserThreadSynthetic} from 'mattermost-redux/types/threads';
import {Post} from 'mattermost-redux/types/posts';
import {Channel} from 'mattermost-redux/types/channels';

import {selectPost} from 'actions/views/rhs';
import {makeOnSubmit} from 'actions/views/create_comment';
import {setGlobalItem, removeGlobalItem} from 'actions/storage';
import {getChannelURL} from 'utils/utils';

import GenericModal from 'components/generic_modal';

import Action from './action';

import './draft_actions.scss';

type Props = {
    channel: Channel;
    channelName: string;
    draftId: string;
    id: string;
    latestPostId: string;
    thread?: UserThread | UserThreadSynthetic;
    type: string;
    value: any;
}

function DraftActions({
    channel,
    channelName,
    draftId,
    id,
    latestPostId,
    thread,
    type,
    value,
}: Props) {
    const [confirm, setConfirm] = useState({show: false, type: ''});
    const history = useHistory();
    const dispatch = useDispatch();
    const teamId = useSelector(getCurrentTeamId);
    const channelUrl = useSelector((state) => getChannelURL(state, channel, teamId));

    const onSubmit = useMemo(() => makeOnSubmit(
        channel.id, thread?.id || '', latestPostId,
    ), [channel.id, thread?.id]);

    const handleSubmit = async () => {
        await dispatch(onSubmit(value));
        return {data: true};
    };

    const handleDelete = useCallback(() => {
        setConfirm({show: true, type: 'delete'});
    }, []);

    const handleEdit = useCallback(() => {
        if (type === 'channel') {
            history.push(channelUrl);
        } else if (thread?.post) {
            dispatch(selectPost({id, ...thread.post} as Post));
        }
    }, [id, thread, type]);

    const handleSend = useCallback(() => {
        setConfirm({show: true, type: 'send'});
    }, []);

    const handleCancel = useCallback(() => {
        setConfirm({show: false, type: confirm.type});
    }, []);

    const handleExit = useCallback(() => {
        setConfirm({show: false, type: ''});
    }, []);

    const handleConfirm = useCallback(() => {
        if (confirm.type === 'delete') {
            localStorage.removeItem(draftId);
            dispatch(setGlobalItem(draftId, {message: '', fileInfos: [], uploadsInProgress: []}));
        } else if (confirm.type === 'send') {
            handleSubmit().then(() => {
                localStorage.removeItem(draftId);
                dispatch(setGlobalItem(draftId, {message: '', fileInfos: [], uploadsInProgress: []}));

                if (thread?.post) {
                    dispatch(selectPost({id, ...thread.post} as Post));
                } else {
                    history.push(channelUrl);
                }
            });
        }
    }, [confirm.type, draftId, channelUrl, id, thread?.post]);

    let title;
    let confirmButtonText;
    let confirmButtonClass;
    let message;

    if (confirm.type === 'send') {
        title = 'Send Message Now';
        confirmButtonText = 'Yes, Send now';
        message = `Are you sure you want to send this message to ${channelName}?`;
    }

    if (confirm.type === 'delete') {
        title = 'Delete Draft';
        confirmButtonText = 'Yes, Delete';
        confirmButtonClass = 'delete';
        message = `Are you sure you want to delete this draft to ${channelName}?`;
    }

    return (
        <>
            <Action
                icon='icon-trash-can-outline'
                id='delete'
                name='delete'
                tooltip={{
                    id: 'id',
                    defaultMessage: 'Delete draft',
                }}
                onClick={handleDelete}
            />
            <Action
                icon='icon-pencil-outline'
                id='edit'
                name='edit'
                tooltip={{
                    id: 'id',
                    defaultMessage: 'Edit draft',
                }}
                onClick={handleEdit}
            />
            <Action
                icon='icon-send-outline'
                id='send'
                name='send'
                tooltip={{
                    id: 'id',
                    defaultMessage: 'Send message',
                }}
                onClick={handleSend}
            />
            <GenericModal
                show={confirm.show}
                modalHeaderText={title}
                confirmButtonClassName={confirmButtonClass}
                confirmButtonText={confirmButtonText}
                handleConfirm={handleConfirm}
                handleCancel={handleCancel}
                onHide={handleExit}
            >
                <div>{message}</div>
            </GenericModal>
        </>
    );
}

export default memo(DraftActions);
