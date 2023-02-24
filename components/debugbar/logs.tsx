// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';

import {getLogs} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarLog} from '@mattermost/types/debugbar';

import Code from './code';
import Time from './time';

type Props = {
    filter: string;
}

function Logs({filter}: Props) {
    let logs = useSelector(getLogs);

    if (filter !== '') {
        logs = logs.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            {logs.map((log: DebugBarLog) => (
                <div
                    key={log.time + '_' + log.message}
                    className='DebugBarTable__row'
                >
                    <div className={cn('time', {error: log.level === 'error'})}><Time time={log.time}/></div>
                    <div
                        className='json'
                        title={JSON.stringify(log.fields)}
                    >
                        <Code
                            code={JSON.stringify(log.fields)}
                            language='json'
                        />
                    </div>
                    <div className='level'>
                        <small className={log.level}>{log.level}</small>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(Logs);
