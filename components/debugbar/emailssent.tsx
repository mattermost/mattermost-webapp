import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getEmailsSent} from 'mattermost-redux/selectors/entities/debug';

type Props = {
    filter: string
}

const EmailsSent = ({filter}: Props) => {
    var emails = useSelector(getEmailsSent)
    if (filter != '') {
        emails = emails.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }
    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>To</th>
                    <th>CC</th>
                    <th>Subject</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
            {emails.map((line: {[key: string]: string}) => (
                <tr>
                    <td>{line.time}</td>
                    <td>{line.to}</td>
                    <td>{line.cc}</td>
                    <td>{line.subject}</td>
                    <td>{line.error}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(EmailsSent);
