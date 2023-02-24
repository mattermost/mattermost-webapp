// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState, useCallback} from 'react';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';
import {getSqlQueries} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarSQLQuery} from '@mattermost/types/debugbar';

import Query from './query';
import Time from './time';

type Props = {
    filter: string;
}

function SQLQueries({filter}: Props) {
    const [explain, setExplain] = useState('');

    const getExplain = useCallback((query: string, args: any[]) => {
        Client4.getExplainQuery(query, args).then((result) => {
            setExplain(result.explain);
        });
    }, []);

    let queries = useSelector(getSqlQueries);

    if (explain) {
        return (
            <div>
                <button onClick={() => setExplain('')}>{'close'}</button>
                <pre>{explain}</pre>
            </div>
        );
    }

    if (filter !== '') {
        queries = queries.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            {queries.map((query: DebugBarSQLQuery) => (
                <div
                    key={query.time + '_' + query.duration}
                    className='DebugBarTable__row'
                >
                    <div className={'time'}><Time time={query.time}/></div>
                    <Query
                        query={query.query}
                        args={query.args}
                    />
                    <div className='duration'>
                        <small className='duration'>{(query.duration * 1000).toFixed(4) + 'ms'}</small>
                    </div>
                    <button onClick={() => getExplain(query.query, query.args)}>{'EXPLAIN'}</button>
                </div>
            ))}
        </div>
    );
}

export default memo(SQLQueries);
