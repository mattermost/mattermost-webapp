// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedTime} from 'react-intl';

import {Audit} from '@mattermost/types/audits';

import {PropsFromRedux} from '.';

interface Props extends PropsFromRedux {
    audit: Audit;
    desc: string;
    showUserId: boolean;
    showIp: boolean;
    showSession: boolean;
}

export default function AuditRow({
    audit,
    desc,
    userId,
    showUserId,
    showIp,
    showSession,
}: Props) {
    const date = new Date(audit.create_at);
    const timestamp = (
        <div>
            <div>
                <FormattedDate
                    value={date}
                    day='2-digit'
                    month='short'
                    year='numeric'
                />
            </div>
            <div>
                <FormattedTime
                    value={date}
                    hour='2-digit'
                    minute='2-digit'
                />
            </div>
        </div>
    );

    const ip = audit.ip_address;
    const sessionId = audit.session_id;

    let uContent;
    if (showUserId) {
        uContent = <td className='word-break--all'>{userId}</td>;
    }

    let iContent;
    if (showIp) {
        iContent = (
            <td className='whitespace--nowrap word-break--all'>
                {ip}
            </td>
        );
    }

    let sContent;
    if (showSession) {
        sContent = (
            <td className='whitespace--nowrap word-break--all'>
                {sessionId}
            </td>
        );
    }

    let descStyle = '';
    if (desc.toLowerCase().indexOf('fail') !== -1) {
        descStyle = ' color--error';
    }

    return (
        <tr key={audit.id}>
            <td className='whitespace--nowrap word-break--all'>
                {timestamp}
            </td>
            {uContent}
            <td className={'word-break--all' + descStyle}>{desc}</td>
            {iContent}
            {sContent}
        </tr>
    );
}
