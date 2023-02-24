// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
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

function DebugBar() {
    const config = useSelector(getConfig);
    const [hidden, setHidden] = useState(true);
    const [height, setHeight] = useState(300);
    const [tab, setTab] = useState('api');
    const [filterText, setFilterText] = useState('');
    const dispatch = useDispatch();

    if (config.DebugBar !== 'true') {
        return null;
    }

    function makeSetTab(tab: string) {
        return () => {
            return setTab(tab);
        };
    }

    function isSelected(current: string): boolean {
        return tab === current;
    }

    function makeItem({tab, text}: {tab: string; text: string}) {
        return (
            <div className='DebugBar__Tab'>
                <button
                    key={tab}
                    className={'header__Button ' + (isSelected(tab) ? 'selected' : '')}
                    onClick={makeSetTab(tab)}
                >
                    {text}
                </button>
            </div>
        );
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
                draggable
                onDragEnd={() => {
                    document.removeEventListener("dragover", (e) => {
                        setHeight(window.innerHeight - e.pageY)
                    })
                }}
                onDragStart={() => {
                    document.addEventListener("dragover", (e) => {
                        setHeight(window.innerHeight - e.pageY)
                    })
                }}
            />
            <div className='header'>
                {ITEMS.map(makeItem)}
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
                {tab === 'api' && <ApiCalls filter={filterText} height={height}/>}
                {tab === 'store' && <StoreCalls filter={filterText} height={height}/>}
                {tab === 'sql' && <SqlQueries filter={filterText} height={height}/>}
                {tab === 'logs' && <Logs filter={filterText} height={height}/>}
                {tab === 'emails' && <EmailsSent filter={filterText} height={height}/>}
                {tab === 'system' && <SystemInfo/>}
            </div>
        </div>
    );
}

export default memo(DebugBar);
