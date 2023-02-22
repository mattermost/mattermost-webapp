import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getApiCalls} from 'mattermost-redux/selectors/entities/debugbar';
import {DebugBarAPICall} from '@mattermost/types/debugbar';

type Props = {
    filter: string
}

const ApiCalls = ({filter}: Props) => {
    var calls = useSelector(getApiCalls)
    if (filter != '') {
        calls = calls.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }

    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Status Code</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
            {calls.map((call: DebugBarAPICall) => (
                <tr>
                    <td>{call.time}</td>
                    <td>{call.endpoint}</td>
                    <td>{call.method}</td>
                    <td>{call.statusCode}</td>
                    <td>{call.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(ApiCalls);
