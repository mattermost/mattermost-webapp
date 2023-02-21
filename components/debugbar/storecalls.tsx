import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getStoreCalls} from 'mattermost-redux/selectors/entities/debug';

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
            {calls.map((line: {[key: string]: string}) => (
                <tr>
                    <td>{line.time}</td>
                    <td>{line.method}</td>
                    <td>{JSON.stringify(line.params)}</td>
                    <td>{line.success}</td>
                    <td>{line.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(StoreCalls);
