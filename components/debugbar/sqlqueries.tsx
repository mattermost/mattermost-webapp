import React, {memo, useState, useCallback} from 'react';
import {useSelector} from 'react-redux';
import {getSqlQueries} from 'mattermost-redux/selectors/entities/debugbar';
import {DebugBarSQLQuery} from '@mattermost/types/debugbar';
import {Client4} from 'mattermost-redux/client';

type Props = {
    filter: string
}

const SQLQueries = ({filter}: Props) => {
    const [explain, setExplain] = useState('')
    const getExplain = useCallback((query: string, args: any[]) => {
        Client4.getExplainQuery(query, args).then((result) => {
            setExplain(result.explain)
        })
    }, [])
    var queries = useSelector(getSqlQueries)

    if (explain) {
        return (
            <div>
                <button onClick={() => setExplain('')}>close</button>
                <pre>{explain}</pre>
            </div>
        )
    }

    if (filter != '') {
        queries = queries.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }

    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th className='time'>Time</th>
                    <th style={{minWidth: '50%'}}>Query</th>
                    <th>Params</th>
                    <th className='duration'>Duration</th>
                    <th className='actions'>Actions</th>
                </tr>
            </thead>
            <tbody>
            {queries.map((query: DebugBarSQLQuery) => (
                <tr>
                    <td className='time'>{query.time}</td>
                    <td>{query.query}</td>
                    <td><pre>{query.args ? JSON.stringify(query.args, null, 4) : ''}</pre></td>
                    <td className='duration'>{query.duration}</td>
                    <td><button onClick={() => getExplain(query.query, query.args)}>explain</button></td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(SQLQueries);
