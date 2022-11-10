// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ClockOutlineIcon} from '@mattermost/compass-icons/components';
import styled from 'styled-components';

import {useGlobalState} from 'stores/hooks';

import ThreadItem from './thread_item';

const DOCKED_THREADS = 'docked_threads';

export const useDockedThreads = () => {
    const [threadIds, setThreadIds] = useGlobalState<string[]>([], DOCKED_THREADS);

    const open = (id: string) => {
        setThreadIds([...threadIds, id]);
    };

    const close = (id: string) => {
        setThreadIds(threadIds.filter((threadId) => threadId !== id));
    };

    return {
        threadIds,
        open,
        close,
    };
};

const DockDock = () => {
    const {threadIds} = useDockedThreads();
    return (
        <footer
            css={`
                grid-area: footer;
                display: flex;
                justify-content: end;
                height: 40px;
                padding: 6px;
                gap: 8px;
                background: var(--global-header-background);
                z-index: 103;
            `}
        >
            {threadIds.map((id, i) => {
                return (
                    <ThreadItem
                        key={id + i}
                        id={id}
                    />
                );
            })}
            <BarItemButton>
                {'Threads'}
            </BarItemButton>
            <ThreadHistory/>
        </footer>
    );
};

const HistoryButton = () => {
    return (
        <BarItemButton>
            <ClockOutlineIcon size={18}/>
        </BarItemButton>
    );
};

const ThreadHistory = () => {
    return (
        <HistoryButton/>
    );
};

export const BarItemButton = styled.button`
    display: inline-flex;
    align-items: center;
    border: none;
    height: 28px;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(var(--sidebar-text-rgb), 0.08);
    box-shadow: none;
    color: rgba(var(--global-header-text-rgb), 0.64);
    font-size: 12px;
    line-height: 16px;
    outline: none;

    &:hover,
    &:focus {
        background: rgba(var(--sidebar-text-rgb), 0.16);
    }
`;

export default DockDock;
