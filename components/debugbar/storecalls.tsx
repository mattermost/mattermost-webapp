// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {FixedSizeList as List} from 'react-window';

import {getStoreCalls} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarStoreCall} from '@mattermost/types/debugbar';

import Code from './code';
import Time from './time';

type Props = {
    filter: string;
    height: number;
    width: number;
}

type RowProps = {
    data: DebugBarStoreCall[];
    index: number;
    style: any;
}

function Row({data, index, style}: RowProps) {
    return (
        <div
            key={data[index].time + '_' + data[index].method + '_' + data[index].duration}
            className='DebugBarTable__row'
            style={style}
        >
            <div className={cn('time', {error: !data[index].success})}><Time time={data[index].time}/></div>
            <div
                className='calls'
                title={data[index].method}
            >
                <Code
                    code={data[index].method}
                    language='golang'
                />
            </div>
            <Code
                code={JSON.stringify(data[index].params)}
                language='json'
            />
            <div className='duration'>
                <small className='duration'>{(data[index].duration * 1000).toFixed(4) + 'ms'}</small>
            </div>
        </div>
    );
}

function StoreCalls({filter, height, width}: Props) {
    let calls = useSelector(getStoreCalls);

    if (filter !== '') {
        calls = calls.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            <List
                itemData={calls}
                itemCount={calls.length}
                itemSize={50}
                height={height}
                width={width - 2}
            >
                {Row}
            </List>
        </div>
    );
}

export default memo(StoreCalls);
