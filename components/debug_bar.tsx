// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {getApiCalls, getStoreCalls, getSqlQueries} from 'mattermost-redux/selectors/entities/debug';
import {clearLines} from 'mattermost-redux/actions/debug';
import {Client4} from 'mattermost-redux/client';

import './debug_bar.scss'

type Props = {};

const DebugBar = (_: Props) => {
    const [hidden, setHidden] = useState(true)
    const [tab, setTab] = useState('api')
    const [filterText, setFilterText] = useState('')
    const dispatch = useDispatch()

    if (hidden) {
        return (<button className='DebugBarButton' onClick={() => setHidden(false)}>Debug</button>)
    }
    return (
        <div className='DebugBar'>
            <div className='header'>
                <button className={tab === 'api' ? 'selected' : ''} onClick={() => setTab('api')}>Api Calls</button>
                <button className={tab === 'store' ? 'selected' : ''}  onClick={() => setTab('store')}>Store Calls</button>
                <button className={tab === 'sql' ? 'selected' : ''}  onClick={() => setTab('sql')}>SQL Queries</button>
                <button className={tab === 'system' ? 'selected' : ''}  onClick={() => setTab('system')}>System Info</button>
                {tab !== 'system' && <input type='text' placeholder='Filter' onChange={(e) => setFilterText(e.target.value)} value={filterText}/>}
                <button className='action' onClick={() => dispatch(clearLines())}>Clear</button>
                <button className='action' onClick={() => setHidden(true)}>Hide</button>
            </div>
            <div className='body'>
                {tab === 'api' && <APICalls filter={filterText}/>}
                {tab === 'store' && <StoreCalls filter={filterText}/>}
                {tab === 'sql' && <SQLQueries filter={filterText}/>}
                {tab === 'system' && <SystemInfo/>}
            </div>
        </div>
    );
};

type StoreCallsProps = {
    filter: string
}

const StoreCalls = ({filter}: StoreCallsProps) => {
    var calls = useSelector(getStoreCalls)
    if (filter != '') {
        calls = calls.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }
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
    filter: string
}

const APICalls = ({filter}: APICallsProps) => {
    var calls = useSelector(getApiCalls)
    if (filter != '') {
        calls = calls.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }

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
    filter: string
}

const SQLQueries = ({filter}: SQLQueriesProps) => {
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

const SystemInfo = () => {
    const [systemInfo, setSystemInfo] = useState<any>(null)
    useEffect(() => {
        const interval = setInterval(() => {
            Client4.getDebugBarSystemInfo().then((result) => {
                setSystemInfo(result)
            })
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [])
    return (
        <div>
            <h2>System Info</h2>
            {JSON.stringify(systemInfo)}
        </div>
    )
}

export default memo(DebugBar);
