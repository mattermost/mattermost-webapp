// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState, useCallback, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import cn from 'classnames';

import {TrashCanOutlineIcon, CloseIcon} from '@mattermost/compass-icons/components';

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

const OPEN = 300;
const CLOSED = 36;

const ITEMS = [
    {tab: 'api', text: 'Api Calls'},
    {tab: 'store', text: 'Store Calls'},
    {tab: 'sql', text: 'SQL Queries'},
    {tab: 'logs', text: 'Server'},
    {tab: 'emails', text: 'Emails'},
    {tab: 'system', text: 'System Info'},
];

function Tab({
    tab,
    text,
    selected,
    onClick,
}: {
    tab: string;
    text: string;
    selected: boolean;
    onClick: (e: React.MouseEvent, tab: string) => void;
}) {
    return (
        <button
            className={cn('header__Button', {selected})}
            onClick={(e) => onClick(e, tab)}
        >
            {text}
        </button>
    );
}

function DebugBar() {
    const config = useSelector(getConfig);
    const [hidden, setHidden] = useState(true);
    const [height, setHeight] = useState(CLOSED);
    const [windowWidth, setWindowWidth] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);
    const [tab, setTab] = useState('');
    const [filterText, setFilterText] = useState('');
    const dispatch = useDispatch();

    const setBarHeight = useCallback((e) => {
        let newHeight = windowHeight - e.pageY;
        if (newHeight < 34) {
            newHeight = 34;
        }
        setHeight(newHeight);
    }, [windowHeight]);

    useEffect(() => {
        const handleSize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
        };
        handleSize();
        window.addEventListener('resize', handleSize);
        return () => {
            window.removeEventListener('resize', handleSize);
        };
    }, []);

    const onOpen = useCallback(() => {
        if (!hidden) {
            return;
        }
        setHidden(false);
        setHeight(OPEN);
    }, [hidden]);

    function onClose() {
        if (hidden) {
            return;
        }
        setHidden(true);
        setHeight(CLOSED);
        setTab('');
    }

    const handleClick = useCallback((e, tab) => {
        e.stopPropagation();

        setTab(tab);
        onOpen();
    }, [onOpen]);

    if (config.DebugBar !== 'true') {
        return null;
    }

    return (
        <div
            className='DebugBar'
            style={{height}}
            onClick={onOpen}
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
                        onClick={handleClick}
                        selected={tab === item.tab}
                    />
                ))}

                {!hidden && (
                    <>
                        {tab !== 'system' && (
                            <QuickInput
                                id='debugbar_filter'
                                placeholder='Filter'
                                className='form-control'
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        )}
                        <div className='DebugBar__Actions'>
                            {tab !== 'system' && (
                                <button
                                    className='header__Button'
                                    onClick={() => dispatch(clearLines())}
                                >
                                    <TrashCanOutlineIcon
                                        title='clear everything'
                                        size={16}
                                        color={'currentColor'}
                                    />
                                </button>
                            )}
                            <button
                                className='header__Button'
                                title='close'
                                onClick={onClose}
                            >
                                <CloseIcon
                                    size={16}
                                    color={'currentColor'}
                                />
                            </button>
                        </div>
                    </>
                )}
            </div>
            <div className='body'>
                {tab === 'api' &&
                    <ApiCalls
                        filter={filterText}
                        height={height}
                        width={windowWidth}
                    />}
                {tab === 'store' &&
                    <StoreCalls
                        filter={filterText}
                        height={height}
                        width={windowWidth}
                    />}
                {tab === 'sql' &&
                    <SqlQueries
                        filter={filterText}
                        height={height}
                        width={windowWidth}
                    />}
                {tab === 'logs' &&
                    <Logs
                        filter={filterText}
                        height={height}
                        width={windowWidth}
                    />}
                {tab === 'emails' &&
                    <EmailsSent
                        filter={filterText}
                        height={height}
                        width={windowWidth}
                    />}
                {tab === 'system' && <SystemInfo/>}
            </div>
        </div>
    );
}

export default memo(DebugBar);
