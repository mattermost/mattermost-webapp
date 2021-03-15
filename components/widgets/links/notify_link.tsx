// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

enum NotifyStatus {
    NotStarted = 'NOT_STARTED',
    Started = 'STARTED',
    Success = 'SUCCESS',
    Failed = 'FAILED'
}

export enum DafaultBtnText {
    NotifyAdmin = 'Notify the admin.',
    Sending = 'Sending...',
    Sent = 'Sent!',
    Failed = 'Failed. Try again later.',
}

type Props = {
    className?: string;
}

const NotifyLink = (props: Props): JSX.Element => {
    const [notifyStatus, setStatus] = useState(NotifyStatus.NotStarted);
    const {formatMessage} = useIntl();

    const notifyFunc = async () => {
        try {
            setStatus(NotifyStatus.Started);
            await Client4.sendAdminUpgradeRequestEmail();
            setStatus(NotifyStatus.Success);
        } catch (error) {
            if (error) {
                setStatus(NotifyStatus.Failed);
            }
        }
    };

    const btnText = (status: NotifyStatus): string => {
        switch (status) {
        case NotifyStatus.Started:
            return formatMessage({id: 'invitation-modal.notify-admin.sending', defaultMessage: DafaultBtnText.Sending});
        case NotifyStatus.Success:
            return formatMessage({id: 'invitation-modal.notify-admin.sent', defaultMessage: DafaultBtnText.Sent});
        case NotifyStatus.Failed:
            return formatMessage({id: 'invitation-modal.notify-admin.failed', defaultMessage: DafaultBtnText.Failed});
        default:
            return formatMessage({id: 'invitation-modal.notify-admin.notify', defaultMessage: DafaultBtnText.NotifyAdmin});
        }
    };
    return (
        <button
            disabled={notifyStatus !== NotifyStatus.NotStarted}
            onClick={() => notifyFunc()}
            className={props.className ? props.className : 'btn-link'}
        >{btnText(notifyStatus)}</button>
    );
};

export default NotifyLink;
