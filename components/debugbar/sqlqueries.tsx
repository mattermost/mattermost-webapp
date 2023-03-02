// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {FixedSizeList as List} from 'react-window';

import {Client4} from 'mattermost-redux/client';
import {getSqlQueries} from 'mattermost-redux/selectors/entities/debugbar';

import {DebugBarSQLQuery} from '@mattermost/types/debugbar';
import {GenericModal} from '@mattermost/components';

import Query from './query';
import Code from './code';
import Time from './time';

type Props = {
    filter: string;
    height: number;
    width: number;
}

type RowProps = {
    data: DebugBarSQLQuery[];
    index: number;
    style: any;
}

function SQLQueries({filter, height, width}: Props) {
    const [explain, setExplain] = useState('');
    const [viewQuery, setViewQuery] = useState<DebugBarSQLQuery|null>(null);

    function Row({data, index, style}: RowProps) {
        return (
            <div
                key={data[index].time + '_' + data[index].duration}
                className='DebugBarTable__row'
                onDoubleClick={() => setViewQuery(data[index])}
                style={style}
            >
                <div className={'time'}><Time time={data[index].time}/></div>
                <Query
                    query={data[index].query}
                    args={data[index].args}
                />
                <div className='duration'>
                    <small className='duration'>{(data[index].duration * 1000).toFixed(4) + 'ms'}</small>
                </div>
            </div>
        );
    }

    useEffect(() => {
        if (viewQuery !== null) {
            Client4.getExplainQuery(viewQuery.query, viewQuery.args).then((result) => {
                setExplain(result.explain);
            });
        }
    }, [viewQuery]);
    let queries = useSelector(getSqlQueries);

    let modal;
    if (viewQuery !== null) {
        modal = (
            <GenericModal
                onExited={() => {
                    setViewQuery(null);
                    setExplain('');
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
                    <h3>{'Raw query:'}</h3>
                    <Code
                        code={viewQuery.query}
                        language='sql'
                        inline={false}
                    />
                    <h3>{'Args:'}</h3>
                    <Code
                        code={JSON.stringify(viewQuery.args, null, 4)}
                        language='json'
                        inline={false}
                    />
                    <h3>{'Explain:'}</h3>
                    <Code
                        code={explain}
                        language='sql'
                        inline={false}
                    />
                </div>
            </GenericModal>
        );
    }

    if (filter !== '') {
        queries = queries.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    return (
        <div className='DebugBarTable'>
            {modal}
            <List
                itemData={queries}
                itemCount={queries.length}
                itemSize={50}
                height={height}
                width={width - 2}
            >
                {Row}
            </List>
        </div>
    );
}

export default memo(SQLQueries);
