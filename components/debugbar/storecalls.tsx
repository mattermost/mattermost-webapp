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
                    <th>Time</th>
                    <th>Method</th>
                    <th>Params</th>
                    <th>Success</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
            {calls.map((call: DebugBarStoreCall) => (
                <tr>
                    <td>{call.time}</td>
                    <td>{call.method}</td>
                    <td>{JSON.stringify(call.params)}</td>
                    <td>{call.success}</td>
                    <td>{call.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(StoreCalls);
