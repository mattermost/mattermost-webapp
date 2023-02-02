// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createContext} from 'react';
import {Saga} from 'redux-saga';

export interface SagaRunnerContextValue {
    isSagaRunning(name: string): boolean;
    startSaga(name: string, saga: Saga): () => void;
}

export const SagaRunnerContext = createContext<SagaRunnerContextValue>(null as any);

export type SagaRunnerContextInstance = typeof SagaRunnerContext;
