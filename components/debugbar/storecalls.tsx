// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';

import {getStoreCalls} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarStoreCall} from '@mattermost/types/debugbar';

import Code from './code';
import Time from './time';

type Props = {
    filter: string;
}

function StoreCalls({filter}: Props) {
    let calls = useSelector(getStoreCalls);

    if (filter !== '') {
        calls = calls.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            {calls.map((call: DebugBarStoreCall) => (
                <div
                    key={call.time + '_' + call.method + '_' + call.duration}
                    className='DebugBarTable__row'
                >
                    <div className={cn('time', {error: !call.success})}><Time time={call.time}/></div>
                    <div
                        className='calls'
                        title={call.method}
                    >
                        <Code
                            code={call.method}
                            language='golang'
                        />
                    </div>
                    <Code
                        code={JSON.stringify(call.params)}
                        language='json'
                    />
                    <div className='duration'>
                        <small className='duration'>{(call.duration * 1000).toFixed(4) + 'ms'}</small>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(StoreCalls);
