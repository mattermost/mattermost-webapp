// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';

import {getApiCalls} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarAPICall} from '@mattermost/types/debugbar';

import Time from './time';

type Props = {
    filter: string;
}

function ApiCalls({filter}: Props) {
    let calls = useSelector(getApiCalls);
    if (filter !== '') {
        calls = calls.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    function getStatusClassName(status: number): string {
        switch (true) {
        case status >= 400:
            return 'error';
        case status >= 300:
            return 'warn';
        default:
            return 'success';
        }
    }

    return (
        <div className='DebugBarTable'>
            {calls.map((call: DebugBarAPICall) => (
                <div
                    key={call.time + '_' + call.duration}
                    className='DebugBarTable__row'
                >
                    <div className={cn('time', getStatusClassName(Number(call.statusCode)))}>
                        <Time time={call.time}/>
                    </div>
                    <div className='method'>{call.method}</div>
                    <div>{call.endpoint}</div>
                    <div className='duration'>
                        <small className='duration mr-1'>{(call.duration * 1000).toFixed(4) + 'ms'}</small>
                        <small className={getStatusClassName(Number(call.statusCode))}>
                            {call.statusCode}
                        </small>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(ApiCalls);
