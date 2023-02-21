import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getApiCalls} from 'mattermost-redux/selectors/entities/debug';

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
            {calls.map((line: {[key: string]: string}) => (
                <tr>
                    <td>{line.time}</td>
                    <td>{line.endpoint}</td>
                    <td>{line.method}</td>
                    <td>{line.statusCode}</td>
                    <td>{line.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(ApiCalls);
