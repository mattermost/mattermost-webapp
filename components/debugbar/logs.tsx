// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {FixedSizeList as List} from 'react-window';

import {getLogs} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarLog} from '@mattermost/types/debugbar';

import Code from './code';
import Time from './time';

type Props = {
    filter: string;
    height: number;
}

type RowProps = {
    data: DebugBarLog[];
    index: number;
    style: any;
}

function Row({data, index, style}: RowProps) {
    return (
        <div
            key={data[index].time + '_' + data[index].message}
            className='DebugBarTable__row'
            style={style}
        >
            <div className={cn('time', {error: data[index].level === 'error'})}><Time time={data[index].time}/></div>
            <div className='logMessage'>
                <small>{data[index].message}</small>
            </div>
            <div
                className='json'
                title={JSON.stringify(data[index].fields)}
            >
                <Code
                    code={JSON.stringify(data[index].fields)}
                    language='json'
                />
            </div>
            <div className='level'>
                <small className={data[index].level}>{data[index].level}</small>
            </div>
        </div>
    )
}

function Logs({filter, height}: Props) {
    let logs = useSelector(getLogs);

    if (filter !== '') {
        logs = logs.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            <List
                itemData={logs}
                itemCount={logs.length}
                itemSize={50}
                height={height}
                width={window.innerWidth-2}
            >
                {Row}
            </List>
        </div>
    );
}

export default memo(Logs);
