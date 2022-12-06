// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getPersistentNotificationInterval, getPersistentNotificationMaxRecipients} from 'mattermost-redux/selectors/entities/posts';

import {GenericModal} from '@mattermost/components';

type Props = {
    mentions: string[];
    hasSpecialMentions: boolean;
    onConfirm: () => void;
    onExited: () => void;
};

function PersistNotificationConfirmModal({
    mentions,
    onConfirm,
    onExited,
}: Props) {
    let message: React.ReactNode = '';
    let title: React.ReactNode = '';
    let confirmBtn: React.ReactNode = '';
    let handleConfirm = () => {};

    const maxRecipients = useSelector(getPersistentNotificationMaxRecipients);
    const interval = useSelector(getPersistentNotificationInterval);

    if (mentions.length > Number(maxRecipients)) {
        title = (
            <FormattedMessage
                id='persist_notification.too_many.title'
                defaultMessage='Too many recipients?'
            />
        );
        message = (
            <FormattedMessage
                id='persist_notification.too_many.description'
                defaultMessage='You can send persistent notifications to a maximum of <b>{max}</b> recipients. There are <b>{count}</b> recipients mentioned in your message. You’ll need to change who you’ve mentioned before you can send.'
                values={{
                    max: maxRecipients,
                    count: mentions.length,
                    b: (chunks: string) => <b>{chunks}</b>,
                }}
            />
        );
        confirmBtn = (
            <FormattedMessage
                id='persist_notification.too_many.confirm'
                defaultMessage='Got it'
            />
        );
    } else {
        handleConfirm = onConfirm;
        title = (
            <FormattedMessage
                id='persist_notification.confirm.title'
                defaultMessage='Send persistent notifications?'
            />
        );
        message = (
            <FormattedMessage
                id='persist_notification.confirm.description'
                defaultMessage='Mentioned recipients will be notified every {interval} minutes until they’ve acknowledged the message.'
                values={{
                    interval,
                }}
            />
        );
        confirmBtn = (
            <FormattedMessage
                id='persist_notification.confirm'
                defaultMessage='Send'
            />
        );
    }

    return (
        <GenericModal
            confirmButtonText={confirmBtn}
            handleCancel={() => {}}
            handleConfirm={handleConfirm}
            modalHeaderText={title}
            onExited={onExited}
            compassDesign={true}
            isDeleteModal={false}
        >
            {message}
        </GenericModal>
    );
}

export default memo(PersistNotificationConfirmModal);
