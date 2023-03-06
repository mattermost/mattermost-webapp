// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {FixedSizeList as List} from 'react-window';
import styled from 'styled-components';

import {Client4} from 'mattermost-redux/client';
import {getSqlQueries} from 'mattermost-redux/selectors/entities/debugbar';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';

import {DebugBarSQLQuery} from '@mattermost/types/debugbar';
import {GlobalState} from '@mattermost/types/store';

import {Code, Query, Time, Input, Footer, Empty} from './components';

type Props = {
    height: number;
    width: number;
}

type RowProps = {
    data: Array<{query: DebugBarSQLQuery; onDoubleClick: (query: DebugBarSQLQuery) => void}>;
    index: number;
    style: React.CSSProperties;
}

const ModalBody = styled.div`
    height: ${({height}: {height: number}) => `calc(100% - ${height + 32}px)`};
    padding: 40px;
    overflow: scroll;
    word-break: break-word;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
`;

const Title = styled.h4`
    border-bottom: 1px dashed currentColor;
    padding-bottom: 10px;
    margin-bottom: 20px;
`;

function Row({data, index, style}: RowProps) {
    const {query, onDoubleClick} = data[index];

    return (
        <div
            key={query.time + '_' + query.duration}
            className='DebugBarTable__row'
            onDoubleClick={() => onDoubleClick((query))}
            style={style}
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
    );
}

function SQLQueries({height, width}: Props) {
    const [explain, setExplain] = useState('');
    const [viewQuery, setViewQuery] = useState<DebugBarSQLQuery|null>(null);
    const [regex, setRegex] = useState<RegExp>();

    useEffect(() => {
        if (viewQuery !== null) {
            Client4.getExplainQuery(viewQuery.query, viewQuery.args).then((result) => {
                setExplain(result.explain);
            });
        }
    }, [viewQuery]);

    const queries = useSelector((state) => getSqlQueries(state as GlobalState, regex));
    const data = queries.map((query) => ({query, onDoubleClick: () => setViewQuery(query)}));

    const modal = (
        <RootPortal>
            <FullScreenModal
                onClose={() => setViewQuery(null)}
                show={viewQuery !== null}
            >
                <ModalBody height={height}>
                    {viewQuery !== null && (
                        <Content>
                            <div>
                                <Title>{'Query'}</Title>
                                <Query
                                    query={viewQuery.query}
                                    args={viewQuery.args}
                                    inline={false}
                                />
                            </div>
                            <div>
                                <Title>{'Raw Query'}</Title>
                                <Code
                                    code={viewQuery.query}
                                    language='sql'
                                    inline={false}
                                />
                            </div>
                            <div>
                                <Title>{'Args'}</Title>
                                <Code
                                    code={JSON.stringify(viewQuery.args, null, 4)}
                                    language='json'
                                    inline={false}
                                />
                            </div>
                            <div>
                                <Title>{'Explain'}</Title>
                                <Code
                                    code={explain}
                                    language='sql'
                                    inline={false}
                                />
                            </div>
                        </Content>
                    )}
                </ModalBody>
            </FullScreenModal>
        </RootPortal>
    );

    return (
        <div className='DebugBarTable'>
            {modal}
            {queries.length > 0 ? (
                <List
                    itemData={data}
                    itemCount={queries.length}
                    itemSize={50}
                    height={height - 32}
                    width={width - 2}
                >
                    {Row}
                </List>
            ) : (
                <Empty height={height - 32}/>
            )}

            <Footer>
                <Input onChange={setRegex}/>
            </Footer>
        </div>
    );
}

export default memo(SQLQueries);
