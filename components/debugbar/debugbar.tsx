// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import cn from 'classnames';

import {clearLines} from 'mattermost-redux/actions/debugbar';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import QuickInput from 'components/quick_input';

import StoreCalls from './storecalls';
import ApiCalls from './apicalls';
import SqlQueries from './sqlqueries';
import SystemInfo from './systeminfo';
import EmailsSent from './emailssent';
import Logs from './logs';

import './debugbar.scss';

const ITEMS = [
    {tab: 'api', text: 'Api Calls'},
    {tab: 'store', text: 'Store Calls'},
    {tab: 'sql', text: 'SQL Queries'},
    {tab: 'logs', text: 'Server'},
    {tab: 'emails', text: 'Emails'},
    {tab: 'system', text: 'System Info'},
];

function Tab({tab, text, selected, onClick}: {tab: string; text: string, selected: boolean; onClick: (tab: string) => void}) {
    return (
        <div className='DebugBar__Tab'>
            <button
                className={cn('header__Button', {selected})}
                onClick={() => onClick(tab)}
            >
                {text}
            </button>
        </div>
    );
}


function DebugBar() {
    const config = useSelector(getConfig);
    const setBarHeight = useCallback((e) => {setHeight(window.innerHeight - e.pageY)}, []);
    const [hidden, setHidden] = useState(true);
    const [height, setHeight] = useState(300);
    const [tab, setTab] = useState('api');
    const [filterText, setFilterText] = useState('');
    const dispatch = useDispatch();

    if (config.DebugBar !== 'true') {
        return null;
    }

    if (hidden) {
        return (
            <button
                className='DebugBarButton'
                onClick={() => setHidden(false)}
            >
                {'Debug'}
            </button>
        );
    }

    return (
        <div
            className='DebugBar'
            style={{
                height,
            }}
        >
            <div
                className='handler'
                draggable={true}
                onDragEnd={() => {
                    document.removeEventListener('dragover', setBarHeight);
                }}
                onDragStart={() => {
                    document.addEventListener('dragover', setBarHeight);
                }}
            />
            <div className='header'>
                {ITEMS.map((item) => (
                    <Tab
                        key={item.tab}
                        tab={item.tab}
                        text={item.text}
                        onClick={setTab}
                        selected={tab === item.tab}
                    />
                ))}
                {tab !== 'system' && (
                    <QuickInput
                        id='searchChannelsTextbox'
                        placeholder='Filter'
                        className='form-control filter-textbox'
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                )}
                <div className='DebugBar__Actions'>
                    {tab !== 'system' && (
                        <div className='DebugBar__Tab'>
                            <button
                                className='header__Button'
                                onClick={() => dispatch(clearLines())}
                            >
                                {'Clear'}
                            </button>
                        </div>
                    )}
                    <div className='DebugBar__Tab'>
                        <button
                            className='header__Button'
                            onClick={() => setHidden(true)}
                        >
                            {'Hide'}
                        </button>
                    </div>
                </div>
            </div>
            <div className='body'>
                {tab === 'api' &&
                    <ApiCalls
                        filter={filterText}
                        height={height}
                    />}
                {tab === 'store' &&
                    <StoreCalls
                        filter={filterText}
                        height={height}
                    />}
                {tab === 'sql' &&
                    <SqlQueries
                        filter={filterText}
                        height={height}
                    />}
                {tab === 'logs' &&
                    <Logs
                        filter={filterText}
                        height={height}
                    />}
                {tab === 'emails' &&
                    <EmailsSent
                        filter={filterText}
                        height={height}
                    />}
                {tab === 'system' && <SystemInfo/>}
            </div>
        </div>
    );
}

export default memo(DebugBar);
