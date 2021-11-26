// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import {openModal, closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import Action from './action';
import SendDraftModal from './send_draft_modal';
import DeleteDraftModal from './delete_draft_modal';

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
    const dispatch = useDispatch();

    const handleDelete = useCallback(() => {
        const handleCancel = () => dispatch(closeModal(ModalIdentifiers.DELETE_DRAFT));
        dispatch(openModal({
            modalId: ModalIdentifiers.DELETE_DRAFT,
            dialogType: DeleteDraftModal,
            dialogProps: {
                displayName,
                onConfirm: () => onDelete(draftId),
                onCancel: handleCancel,
            },
        }));
    }, [displayName]);

    const handleSend = useCallback(() => {
        const handleCancel = () => dispatch(closeModal(ModalIdentifiers.SEND_DRAFT));
        dispatch(openModal({
            modalId: ModalIdentifiers.SEND_DRAFT,
            dialogType: SendDraftModal,
            dialogProps: {
                displayName,
                onConfirm: () => onSend(draftId),
                onCancel: handleCancel,
            },
        }));
    }, [displayName]);

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
        </>
    );
}

export default memo(DraftActions);
