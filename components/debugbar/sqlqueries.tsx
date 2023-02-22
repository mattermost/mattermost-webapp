import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getSqlQueries} from 'mattermost-redux/selectors/entities/debugbar';

type Props = {
    filter: string
}

const SQLQueries = ({filter}: Props) => {
    var queries = useSelector(getSqlQueries)
    if (filter != '') {
        queries = queries.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }
    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th>Time</th>
                    <th style={{minWidth: '50%'}}>Query</th>
                    <th>Params</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
            {queries.map((line: {[key: string]: any}) => (
                <tr>
                    <td>{line.time}</td>
                    <td>{line.query}</td>
                    <td>{line.args ? JSON.stringify(line.args) : ''}</td>
                    <td>{line.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(SQLQueries);
