// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';

import {getEmailsSent} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarEmailSent} from '@mattermost/types/debugbar';

import Time from './time';

type Props = {
    filter: string;
}

function EmailsSent({filter}: Props) {
    let emails = useSelector(getEmailsSent);
    if (filter !== '') {
        emails = emails.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            {emails.map((email: DebugBarEmailSent) => (
                <div
                    key={email.time + '_' + email.subject}
                    className='DebugBarTable__row'
                >
                    <div className={cn('time', {error: email.err})}>
                        <Time time={email.time}/>
                    </div>
                    <div className='address pl-2'>{email.to}</div>
                    <div className='address pl-2'>{email.cc}</div>
                    <div className='subject pl-2'>
                        {email.subject}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(EmailsSent);
