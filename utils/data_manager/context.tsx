// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {Saga, SagaMiddleware, Task} from 'redux-saga';

interface ManagerState {
    isSagaRunning(name: string): boolean;
    runSaga(name: string, saga: Saga): void;
}

// TODO Come up with a proper default value for usage when testing
const ManagerContext = createContext<ManagerState>({} as ManagerState);

export function useManager() {
    return useContext(ManagerContext);
}

export type ProviderProps = {
    children: React.ReactNode;
    sagaMiddleware: SagaMiddleware;
}

export function Provider(props: ProviderProps) {
    // TODO add a way for manager hooks to safely register sagas with the middleware
    const [runningSagas, setRunningSagas] = useState(new Map<string, Task>());

    const isSagaRunning = useCallback((name) => runningSagas.has(name), [runningSagas]);

    const runSaga = useCallback((name: string, saga: Saga) => {
        const task = props.sagaMiddleware.run(saga);

        setRunningSagas(new Map([
            ...runningSagas,
            [name, task],
        ]));
    }, [props.sagaMiddleware, runningSagas]);

    const managerState = useMemo(() => ({
        isSagaRunning,
        runSaga,
    }), [isSagaRunning, runSaga]);

    return (
        <ManagerContext.Provider value={managerState}>
            {props.children}
        </ManagerContext.Provider>
    );
}
