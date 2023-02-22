import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getEmailsSent} from 'mattermost-redux/selectors/entities/debugbar';
import {DebugBarEmailSent} from '@mattermost/types/debugbar';

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
            {emails.map((email: DebugBarEmailSent) => (
                <tr>
                    <td>{email.time}</td>
                    <td>{email.to}</td>
                    <td>{email.cc}</td>
                    <td>{email.subject}</td>
                    <td>{email.err}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(EmailsSent);
