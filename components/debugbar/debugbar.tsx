// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {clearLines} from 'mattermost-redux/actions/debug';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import StoreCalls from './storecalls';
import ApiCalls from './apicalls';
import SqlQueries from './sqlqueries';
import SystemInfo from './systeminfo';
import EmailsSent from './emailssent';
import Logs from './logs';

import './debugbar.scss'

type Props = {};

const DebugBar = (_: Props) => {
    const config = useSelector(getConfig)
    const [hidden, setHidden] = useState(true)
    const [tab, setTab] = useState('api')
    const [filterText, setFilterText] = useState('')
    const dispatch = useDispatch()

    if (config.DebugBar !== "true") {
        return null
    }

    if (hidden) {
        return (<button className='DebugBarButton' onClick={() => setHidden(false)}>Debug</button>)
    }
    return (
        <div className='DebugBar'>
            <div className='header'>
                <button className={tab === 'api' ? 'selected' : ''} onClick={() => setTab('api')}>Api Calls</button>
                <button className={tab === 'store' ? 'selected' : ''}  onClick={() => setTab('store')}>Store Calls</button>
                <button className={tab === 'sql' ? 'selected' : ''}  onClick={() => setTab('sql')}>SQL Queries</button>
                <button className={tab === 'logs' ? 'selected' : ''}  onClick={() => setTab('logs')}>Server Logs</button>
                <button className={tab === 'emails' ? 'selected' : ''}  onClick={() => setTab('emails')}>Emails</button>
                <button className={tab === 'system' ? 'selected' : ''}  onClick={() => setTab('system')}>System Info</button>
                {tab !== 'system' && <input type='text' placeholder='Filter' onChange={(e) => setFilterText(e.target.value)} value={filterText}/>}
                {tab !== 'system' && <button className='action' onClick={() => dispatch(clearLines())}>Clear</button>}
                <button className='action' onClick={() => setHidden(true)}>Hide</button>
            </div>
            <div className='body'>
                {tab === 'api' && <ApiCalls filter={filterText}/>}
                {tab === 'store' && <StoreCalls filter={filterText}/>}
                {tab === 'sql' && <SqlQueries filter={filterText}/>}
                {tab === 'logs' && <Logs filter={filterText}/>}
                {tab === 'emails' && <EmailsSent filter={filterText}/>}
                {tab === 'system' && <SystemInfo/>}
            </div>
        </div>
    );
};

export default memo(DebugBar);
