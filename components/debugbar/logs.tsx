import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getLogs} from 'mattermost-redux/selectors/entities/debugbar';
import {DebugBarLog} from '@mattermost/types/debugbar';

type Props = {
    filter: string
}

const Logs = ({filter}: Props) => {
    var logs = useSelector(getLogs)
    if (filter != '') {
        logs = logs.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }
    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th className='time'>Time</th>
                    <th className='level'>Level</th>
                    <th>Message</th>
                    <th>Fields</th>
                </tr>
            </thead>
            <tbody>
            {logs.map((log: DebugBarLog) => (
                <tr>
                    <td className='time'>{log.time}</td>
                    <td className='level'>{log.level}</td>
                    <td>{log.message}</td>
                    <td><pre>{JSON.stringify(log.fields, null, 4)}</pre></td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(Logs);
