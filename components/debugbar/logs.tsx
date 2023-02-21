import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getLogs} from 'mattermost-redux/selectors/entities/debug';

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
                    <th>Time</th>
                    <th>Level</th>
                    <th>Message</th>
                    <th>Fields</th>
                </tr>
            </thead>
            <tbody>
            {logs.map((line: {[key: string]: string}) => (
                <tr>
                    <td>{line.time}</td>
                    <td>{line.level}</td>
                    <td>{line.message}</td>
                    <td>{JSON.stringify(line.fields)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(Logs);
