import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getStoreCalls} from 'mattermost-redux/selectors/entities/debugbar';
import {DebugBarStoreCall} from '@mattermost/types/debugbar';

type Props = {
    filter: string
}

const StoreCalls = ({filter}: Props) => {
    var calls = useSelector(getStoreCalls)
    if (filter != '') {
        calls = calls.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }
    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th className='time'>Time</th>
                    <th>Method</th>
                    <th>Params</th>
                    <th className='success'>Success</th>
                    <th className='duration'>Duration</th>
                </tr>
            </thead>
            <tbody>
            {calls.map((call: DebugBarStoreCall) => (
                <tr>
                    <td className='time'>{call.time}</td>
                    <td>{call.method}</td>
                    <td><pre>{JSON.stringify(call.params, null, 4)}</pre></td>
                    <td className='success'>{call.success}</td>
                    <td className='duration'>{call.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(StoreCalls);
