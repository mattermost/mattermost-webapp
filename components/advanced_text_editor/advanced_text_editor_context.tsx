// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

const MAXLEN = 10;

type Context = {
    content: string;
    setContent: (content: string) => void;
    isUndoable: boolean;
    isRedoable: boolean;
    undo: () => void;
    redo: () => void;
}

const UndoableContext = React.createContext<Context|null>(null);

interface ProviderProps {
    children: React.ReactNode | React.ReactNodeArray;
    maxHistoryLength?: number;
}

const UndoableProvider = ({children, maxHistoryLength = MAXLEN}: ProviderProps) => {
    const [past, setPast] = React.useState<string[]>([]);
    const [present, setPresent] = React.useState('');
    const [future, setFuture] = React.useState<string[]>([]);

    const setContent = (content: string) => {
        setPast((old) => [present, ...old].slice(0, maxHistoryLength));
        setPresent(content);
    };

    const undo = () => {
        if (past.length < 1 || past.length > maxHistoryLength) {
            return;
        }

        const [last, ...rest] = past;

        setPast(rest);
        setFuture((old) => [present, ...old]);
        setPresent(last);
    };

    const redo = () => {
        if (future.length < 1 || future.length > maxHistoryLength) {
            return;
        }

        const [first, ...rest] = future;

        setFuture(rest);
        setPresent(first);
        setPast((old) => [present, ...old]);
    };

    return (
        <UndoableContext.Provider
            value={{
                content: present,
                setContent,
                undo,
                redo,
                isUndoable: past.length > 0,
                isRedoable: future.length > 0,
            }}
        >
            {children}
        </UndoableContext.Provider>
    );
};

const useUndoable = () => {
    const state = React.useContext(UndoableContext);

    if (state === null) {
        throw new Error('## Context cannot be null ##');
    }

    return state;
};

const withUndoable = (Component: React.FC<any>) => (props: any) => {
    return (
        <UndoableProvider>
            <Component {...props}/>
        </UndoableProvider>
    );
};

export {UndoableContext, useUndoable, UndoableProvider, withUndoable};
