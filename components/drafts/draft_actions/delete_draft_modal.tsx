// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import GenericModal from 'components/generic_modal';

type Props = {
    displayName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteDraftModal({
    displayName,
    onCancel,
    onConfirm,
}: Props) {
    const {formatMessage} = useIntl();

    const title = formatMessage({
        id: 'drafts.confirm.delete.title',
        defaultMessage: 'Delete Draft',
    });

    const confirmButtonText = formatMessage({
        id: 'drafts.confirm.delete.button',
        defaultMessage: 'Yes, Delete',
    });

    const message = (
        <FormattedMessage
            id={'drafts.confirm.delete.text'}
            defaultMessage={'Are you sure you want to delete this draft to <strong>{displayName}</strong>?'}
            values={{
                strong: (chunk: string) => <strong>{chunk}</strong>,
                displayName,
            }}
        />
    );

    return (
        <GenericModal
            confirmButtonClassName='delete'
            confirmButtonText={confirmButtonText}
            handleCancel={() => {}}
            handleConfirm={onConfirm}
            modalHeaderText={title}
            onExited={onCancel}
        >
            <div>{message}</div>
        </GenericModal>
    );
}

export default DeleteDraftModal;
