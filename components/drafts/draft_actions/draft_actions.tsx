// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import GenericModal from 'components/generic_modal';

import Action from './action';

import './draft_actions.scss';

type Props = {
    displayName: string;
    draftId: string;
    onDelete: (draftId: string) => void;
    onEdit: () => void;
    onSend: (draftId: string) => void;
}

function DraftActions({
    displayName,
    draftId,
    onDelete,
    onEdit,
    onSend,
}: Props) {
    const {formatMessage} = useIntl();
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
        title = formatMessage({
            id: 'drafts.confirm.send.title',
            defaultMessage: 'Send Message now',
        });
        confirmButtonText = formatMessage({
            id: 'drafts.confirm.send.button',
            defaultMessage: 'Yes, Send Now',
        });
        message = (
            <FormattedMessage
                id={'drafts.confirm.send.text'}
                defaultMessage={'Are you sure you want to send this message to <strong>{displayName}</strong>?'}
                values={{
                    strong: (chunk: string) => <strong>{chunk}</strong>,
                    displayName,
                }}
            />
        );
    }

    if (confirm.type === 'delete') {
        confirmButtonClass = 'delete';

        title = formatMessage({
            id: 'drafts.confirm.delete.title',
            defaultMessage: 'Delete Draft',
        });
        confirmButtonText = formatMessage({
            id: 'drafts.confirm.delete.button',
            defaultMessage: 'Yes, Delete',
        });
        message = (
            <FormattedMessage
                id={'drafts.confirm.delete.text'}
                defaultMessage={'Are you sure you want to delete this draft to <strong>{displayName}</strong>?'}
                values={{
                    strong: (chunk: string) => <strong>{chunk}</strong>,
                    displayName,
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
                tooltipText={(
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
                tooltipText={(
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
                tooltipText={(
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
                onExited={handleCancel}
            >
                <div>{message}</div>
            </GenericModal>
        </>
    );
}

export default memo(DraftActions);
