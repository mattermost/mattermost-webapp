// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';

const MAXLEN = 50;

type Context = {
    content: string;
    setContent: (content: string) => void;
    clearContent: () => void;
    isUndoable: boolean;
    isRedoable: boolean;
    undo: () => void;
    redo: () => void;
}

const UndoableContext = React.createContext<Context|null>(null);

interface ProviderProps {
    children: React.ReactNode | React.ReactNodeArray;
    maxHistoryLength?: number;
    onContentChange?: (content: string) => void;
}

const UndoableProvider = ({children, onContentChange, maxHistoryLength = MAXLEN}: ProviderProps) => {
    const [past, setPast] = React.useState<string[]>([]);
    const [present, setPresent] = React.useState('');
    const [future, setFuture] = React.useState<string[]>([]);

    useEffect(() => onContentChange?.(present), [present]);

    const setContent = (content: string) => {
        setPast((old) => [present, ...old].slice(0, maxHistoryLength));
        setFuture([]);
        setPresent(content);
    };

    const clearContent = () => {
        setPast([]);
        setFuture([]);
        setPresent('');
    };

    const undo = useCallback(() => {
        if (past.length < 1 || past.length > maxHistoryLength) {
            return;
        }

        const [last, ...rest] = past;

        setPast(rest);
        setFuture((old) => [present, ...old]);
        setPresent(last);
    }, [maxHistoryLength, past, present]);

    const redo = useCallback(() => {
        if (future.length < 1 || future.length > maxHistoryLength) {
            return;
        }

        const [first, ...rest] = future;

        setFuture(rest);
        setPresent(first);
        setPast((old) => [present, ...old]);
    }, [maxHistoryLength, future, present]);

    useEffect(() => {
        const handleCtrl = (event: KeyboardEvent) => {
            const {keyCode} = event;

            const ctrl = event.ctrlKey || event.metaKey;

            if (!ctrl || keyCode !== 90) {
                return;
            }

            event.stopPropagation();
            event.preventDefault();

            if (event.shiftKey) {
                redo();
            } else {
                undo();
            }
        };

        document.addEventListener('keydown', handleCtrl);

        return () => document.removeEventListener('keydown', handleCtrl);
    }, [undo, redo]);

    return (
        <UndoableContext.Provider
            value={{
                content: present,
                setContent,
                clearContent,
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

export {UndoableContext, useUndoable, UndoableProvider};
