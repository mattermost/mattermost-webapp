// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useState} from 'react';

import {NotifyAdminRequest} from '@mattermost/types/cloud';
import {Client4} from 'mattermost-redux/client';
import {trackEvent} from 'actions/telemetry_actions';

export const NotifyStatus = {
    NotStarted: 'NOT_STARTED',
    Started: 'STARTED',
    Success: 'SUCCESS',
    Failed: 'FAILED',
    AlreadyComplete: 'COMPLETE',
} as const;

export type NotifyStatusValues = ValueOf<typeof NotifyStatus>;

export const DafaultBtnText = {
    NotifyAdmin: 'Notify your admin',
    Notifying: 'Notifying...',
    Notified: 'Notified!',
    AlreadyNotified: 'Already notified!',
    Failed: 'Try again later!',
} as const;

type ValueOf<T> = T[keyof T];

type UseNotifyAdminArgs = {
    ctaText?: {
        id: string;
        defaultMessage: string;
    };
}

type NotifyAdmingArgs = {
    requestData: NotifyAdminRequest;
    trackingArgs: {
        category: any;
        event: any;
        props?: any;
    };
}

export const useGetNotifyAdmin = (args: UseNotifyAdminArgs) => {
    const [notifyStatus, setStatus] = useState<ValueOf<typeof NotifyStatus>>(NotifyStatus.NotStarted);

    const btnText = (status: ValueOf<typeof NotifyStatus>): {id: string; defaultMessage: string} => {
        switch (status) {
        case NotifyStatus.Started:
            return {id: 'notify_admin_to_upgrade_cta.notify-admin.notifying', defaultMessage: DafaultBtnText.Notifying};
        case NotifyStatus.Success:
            return {id: 'notify_admin_to_upgrade_cta.notify-admin.notified', defaultMessage: DafaultBtnText.Notified};
        case NotifyStatus.AlreadyComplete:
            return {id: 'notify_admin_to_upgrade_cta.notify-admin.already_notified', defaultMessage: DafaultBtnText.AlreadyNotified};
        case NotifyStatus.Failed:
            return {id: 'notify_admin_to_upgrade_cta.notify-admin.failed', defaultMessage: DafaultBtnText.Failed};
        default:
            return args.ctaText || {id: 'notify_admin_to_upgrade_cta.notify-admin.notify', defaultMessage: DafaultBtnText.NotifyAdmin};
        }
    };

    const notifyAdmin = async ({requestData, trackingArgs}: NotifyAdmingArgs) => {
        try {
            setStatus(NotifyStatus.Started);
            await Client4.notifyAdmin(requestData);
            trackEvent(trackingArgs.category, trackingArgs.event, trackingArgs.props);
            setStatus(NotifyStatus.Success);
        } catch (error) {
            if (error && error.status_code === 403) {
                setStatus(NotifyStatus.AlreadyComplete);
            } else {
                setStatus(NotifyStatus.Failed);
            }
        }
    };

    return {
        notifyStatus,
        btnText,
        notifyAdmin,
    };
};
