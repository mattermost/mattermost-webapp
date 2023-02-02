// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useRef} from 'react';
import {Saga, SagaMiddleware, Task} from 'redux-saga';

import {SagaRunnerContext} from './context';

export type Props = {
    children: React.ReactNode;
    sagaMiddleware: SagaMiddleware;
}

export function SagaProvider(props: Props) {
    // Store the middleware as a ref to ensure that it never changes
    const sagaMiddleware = useRef(props.sagaMiddleware);

    // Store the running sagas in a ref so that we can operate on them so that the unregister callbacks returned by
    // startSaga remain valid
    const runningSagas = useRef(new Map<string, Task>());

    const isSagaRunning = useCallback((name) => runningSagas.current.has(name), []);

    const startSaga = useCallback((name: string, saga: Saga) => {
        if (isSagaRunning(name)) {
            // eslint-disable-next-line no-console
            console.error(`There is already a saga named ${name} running. Not running a second instance.`);
            return () => {};
        }

        const task = sagaMiddleware.current.run(saga);

        runningSagas.current.set(name, task);

        return () => {
            if (!isSagaRunning(name)) {
                // eslint-disable-next-line no-console
                console.error(`Attempted to end a saga named ${name} when there isn't one running. Doing nothing.`);
                return;
            }

            const task = runningSagas.current.get(name);
            runningSagas.current.delete(name);

            task?.cancel();
        };
    }, [isSagaRunning]);

    const runnerState = useMemo(() => ({
        isSagaRunning,
        startSaga,
    }), [isSagaRunning, startSaga]);

    return (
        <SagaRunnerContext.Provider value={runnerState}>
            {props.children}
        </SagaRunnerContext.Provider>
    );
}
