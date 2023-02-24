// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {FixedSizeList as List} from 'react-window';

import {getEmailsSent} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarEmailSent} from '@mattermost/types/debugbar';

import Time from './time';

type Props = {
    filter: string;
    height: number;
}

type RowProps = {
    data: DebugBarEmailSent[];
    index: number;
    style: any;
}

function Row({data, index, style}: RowProps) {
    return (
        <div
            key={data[index].time + '_' + data[index].subject}
            className='DebugBarTable__row'
            style={style}
        >
            <div className={cn('time', {error: data[index].err})}>
                <Time time={data[index].time}/>
            </div>
            <div className='address pl-2'>{data[index].to}</div>
            <div className='address pl-2'>{data[index].cc}</div>
            <div className='subject pl-2'>
                {data[index].subject}
            </div>
        </div>
    )
}

function EmailsSent({filter, height}: Props) {
    let emails = useSelector(getEmailsSent);
    if (filter !== '') {
        emails = emails.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            <List
                itemData={emails}
                itemCount={emails.length}
                itemSize={50}
                height={height}
                width={window.innerWidth-2}
            >
                {Row}
            </List>
        </div>
    );
}

export default memo(EmailsSent);
