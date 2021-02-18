// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

const NotifyLink = (): JSX.Element => {
    const NOT_STARTED = 'Not_Started';
    const STARTED = 'Started';
    const SUCCESS = 'Success';
    const FAILED = 'Failed';

    const [notifyStatus, setStatus] = useState(NOT_STARTED);
    const {formatMessage} = useIntl();

    const notifyFunc = async () => {
        try {
            setStatus(STARTED);
            await Client4.sendAdminUpgradeRequestEmail();
            setStatus(SUCCESS);
        } catch (error) {
            if (error) {
                setStatus(FAILED);
            }
        }
    };

    const btnText = (status: string): string => {
        switch (status) {
        case STARTED:
            return formatMessage({id: 'invitation-modal.notify-admin.sending', defaultMessage: 'Sending...'});
        case SUCCESS:
            return formatMessage({id: 'invitation-modal.notify-admin.sent', defaultMessage: 'Sent!'});
        case FAILED:
            return formatMessage({id: 'invitation-modal.notify-admin.failed', defaultMessage: 'Failed. Try again later.'});
        default:
            return formatMessage({id: 'invitation-modal.notify-admin.notify', defaultMessage: 'Notify the admin.'});
        }
    };
    return (
        <button
            disabled={notifyStatus !== NOT_STARTED}
            onClick={() => notifyFunc()}
            className='btn-link'
        >{btnText(notifyStatus)}</button>
    );
};

export default NotifyLink;
