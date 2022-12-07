// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getPersistentNotificationInterval, getPersistentNotificationMaxRecipients} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store';
import {makeGetUserOrGroupMentionCountFromMessage} from 'utils/post_utils';

import {GenericModal} from '@mattermost/components';

type Props = {
    message: string;
    hasSpecialMentions: boolean;
    onConfirm: () => void;
    onExited: () => void;
};

function PersistNotificationConfirmModal({
    message,
    onConfirm,
    onExited,
}: Props) {
    let body: React.ReactNode = '';
    let title: React.ReactNode = '';
    let confirmBtn: React.ReactNode = '';
    let handleConfirm = () => {};

    const getMentionCount = useMemo(makeGetUserOrGroupMentionCountFromMessage, []);
    const maxRecipients = useSelector(getPersistentNotificationMaxRecipients);
    const interval = useSelector(getPersistentNotificationInterval);
    const count = useSelector((state: GlobalState) => getMentionCount(state, message));

    if (count > Number(maxRecipients)) {
        title = (
            <FormattedMessage
                id='persist_notification.too_many.title'
                defaultMessage='Too many recipients?'
            />
        );
        body = (
            <FormattedMessage
                id='persist_notification.too_many.description'
                defaultMessage='You can send persistent notifications to a maximum of <b>{max}</b> recipients. There are <b>{count}</b> recipients mentioned in your message. You’ll need to change who you’ve mentioned before you can send.'
                values={{
                    max: maxRecipients,
                    count,
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
        body = (
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
            {body}
        </GenericModal>
    );
}

export default memo(PersistNotificationConfirmModal);
