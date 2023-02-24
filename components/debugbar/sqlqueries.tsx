// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';
import {getSqlQueries} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarSQLQuery} from '@mattermost/types/debugbar';
import {GenericModal} from '@mattermost/components';

import Query from './query';
import Code from './code';
import Time from './time';

type Props = {
    filter: string;
}

function SQLQueries({filter}: Props) {
    const [explain, setExplain] = useState('');
    const [viewQuery, setViewQuery] = useState<DebugBarSQLQuery|null>(null)

    useEffect(() => {
        if (viewQuery !== null) {
            Client4.getExplainQuery(viewQuery.query, viewQuery.args).then((result) => {
                setExplain(result.explain)
            })
        }
    }, [viewQuery]);
    var queries = useSelector(getSqlQueries)

    let modal
    if (viewQuery !== null) {
        modal = (
            <GenericModal
                onExited={() => {
                    setViewQuery(null)
                    setExplain('')
                }}
                show={true}
                modalHeaderText='Sql Query'
                compassDesign={true}
                className='DebugBarModal'
            >
                <div>
                    <Query
                        query={viewQuery.query}
                        args={viewQuery.args}
                        inline={false}
                    />
                    <h3>Explain:</h3>
                    <Code
                        code={explain}
                        language='sql'
                        inline={false}
                    />
                </div>
            </GenericModal>
        )
    }

    if (filter !== '') {
        queries = queries.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            {modal}
            {queries.map((query: DebugBarSQLQuery) => (
                <div
                    key={query.time + '_' + query.duration}
                    className='DebugBarTable__row'
                    onDoubleClick={() => setViewQuery(query)}
                >
                    <div className={'time'}><Time time={query.time}/></div>
                    <Query
                        query={query.query}
                        args={query.args}
                    />
                    <div className='duration'>
                        <small className='duration'>{(query.duration * 1000).toFixed(4) + 'ms'}</small>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(SQLQueries);
