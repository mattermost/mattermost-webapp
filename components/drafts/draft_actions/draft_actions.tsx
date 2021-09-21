// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {localizeMessage} from 'utils/utils';
import {t} from 'utils/i18n';

import GenericModal from 'components/generic_modal';

import Action from './action';

import './draft_actions.scss';

type Props = {
    channelName: string;
    draftId: string;
    onDelete: (draftId: string) => void;
    onEdit: () => void;
    onSend: (draftId: string) => void;
}

function DraftActions({
    channelName,
    draftId,
    onDelete,
    onEdit,
    onSend,
}: Props) {
    const [confirm, setConfirm] = useState({show: false, type: ''});

    const handleDelete = useCallback(() => {
        setConfirm({show: true, type: 'delete'});
    }, []);

    const handleSend = useCallback(() => {
        setConfirm({show: true, type: 'send'});
    }, []);

    const handleCancel = useCallback(() => {
        setConfirm({show: false, type: confirm.type});
    }, []);

    const handleConfirm = useCallback(() => {
        if (confirm.type === 'delete') {
            onDelete(draftId);
        } else if (confirm.type === 'send') {
            onSend(draftId);
        }
    }, [confirm.type, draftId]);

    let title;
    let confirmButtonText;
    let confirmButtonClass;
    let message;

    if (confirm.type === 'send') {
        title = localizeMessage(
            'drafts.confirm.send.title',
            'Send Message now',
        );
        confirmButtonText = localizeMessage(
            'drafts.confirm.send.button',
            'Yes, Send Now',
        );
        message = (
            <FormattedMessage
                id={t('drafts.confirm.send.text')}
                defaultMessage={'Are you sure you want to send this message to <b>{channelName}</b>?'}
                values={{
                    b: (chunk: string) => <b>{chunk}</b>,
                    channelName,
                }}
            />
        );
    }

    if (confirm.type === 'delete') {
        confirmButtonClass = 'delete';

        title = localizeMessage(
            'drafts.confirm.delete.title',
            'Delete Draft',
        );
        confirmButtonText = localizeMessage(
            'drafts.confirm.delete.button',
            'Yes, Delete',
        );
        message = (
            <FormattedMessage
                id={t('drafts.confirm.delete.text')}
                defaultMessage={'Are you sure you want to delete this draft to <b>{channelName}</b>?'}
                values={{
                    b: (chunk: string) => <b>{chunk}</b>,
                    channelName,
                }}
            />
        );
    }

    return (
        <>
            <Action
                icon='icon-trash-can-outline'
                id='delete'
                name='delete'
                tooltip={(
                    <FormattedMessage
                        id='drafts.actions.delete'
                        defaultMessage='Delete draft'
                    />
                )}
                onClick={handleDelete}
            />
            <Action
                icon='icon-pencil-outline'
                id='edit'
                name='edit'
                tooltip={(
                    <FormattedMessage
                        id='drafts.actions.edit'
                        defaultMessage='Edit draft'
                    />
                )}
                onClick={onEdit}
            />
            <Action
                icon='icon-send-outline'
                id='send'
                name='send'
                tooltip={(
                    <FormattedMessage
                        id='drafts.actions.send'
                        defaultMessage='Send draft'
                    />
                )}
                onClick={handleSend}
            />
            <GenericModal
                show={confirm.show}
                modalHeaderText={title}
                confirmButtonClassName={confirmButtonClass}
                confirmButtonText={confirmButtonText}
                handleConfirm={handleConfirm}
                handleCancel={handleCancel}
                onHide={handleCancel}
            >
                <div>{message}</div>
            </GenericModal>
        </>
    );
}

export default memo(DraftActions);
