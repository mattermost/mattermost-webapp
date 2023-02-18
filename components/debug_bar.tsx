// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {getDebugLines} from 'mattermost-redux/selectors/entities/debug';
import {clearLines} from 'mattermost-redux/actions/debug';

import './debug_bar.scss'

type Props = {};

const DebugBar = (_: Props) => {
    const [hidden, setHidden] = useState(true)
    const [filter, setFilter] = useState('api-call')
    const [filterText, setFilterText] = useState('')
    const dispatch = useDispatch()
    var debugLines = useSelector(getDebugLines).filter((v) => v.type == filter)

    if (filterText != '') {
        debugLines = debugLines.filter((v) => JSON.stringify(v).indexOf(filterText) !== -1)
    }

    if (hidden) {
        return (<button className='DebugBarButton' onClick={() => setHidden(false)}>Debug</button>)
    }
    return (
        <div className='DebugBar'>
            <div className='header'>
                <button className={filter === 'api-call' ? 'selected' : ''} onClick={() => setFilter('api-call')}>Api Calls</button>
                <button className={filter === 'store-call' ? 'selected' : ''}  onClick={() => setFilter('store-call')}>Store Calls</button>
                <button className={filter === 'sql-query' ? 'selected' : ''}  onClick={() => setFilter('sql-query')}>SQL Queries</button>
                <input type='text' placeholder='Filter' onChange={(e) => setFilterText(e.target.value)} value={filterText}/>
                <button className='action' onClick={() => dispatch(clearLines())}>Clear</button>
                <button className='action' onClick={() => setHidden(true)}>Hide</button>
            </div>
            <div className='body'>
                {filter === 'api-call' && <APICalls calls={debugLines}/>}
                {filter === 'store-call' && <StoreCalls calls={debugLines}/>}
                {filter === 'sql-query' && <SQLQueries queries={debugLines}/>}
            </div>
        </div>
    );
};

type StoreCallsProps = {
    calls: any[]
}

const StoreCalls = ({calls}: StoreCallsProps) => {
    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Method</th>
                    <th>Success</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
            {calls.map((line: {[key: string]: string}) => (
                <tr>
                    <td>{line.time}</td>
                    <td>{line.method}</td>
                    <td>{line.success}</td>
                    <td>{line.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

type APICallsProps = {
    calls: any[]
}

const APICalls = ({calls}: APICallsProps) => {
    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Status Code</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
            {calls.map((line: {[key: string]: string}) => (
                <tr>
                    <td>{line.time}</td>
                    <td>{line.endpoint}</td>
                    <td>{line.method}</td>
                    <td>{line.statusCode}</td>
                    <td>{line.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

type SQLQueriesProps = {
    queries: any[]
}

const SQLQueries = ({queries}: SQLQueriesProps) => {
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

export default memo(DebugBar);
