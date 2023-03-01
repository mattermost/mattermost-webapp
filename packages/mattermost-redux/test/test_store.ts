// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AnyAction} from 'redux';

import {GlobalState} from '@mattermost/types/store';
import configureStore from 'mattermost-redux/store';

export default function testConfigureStore(preloadedState?: any) {
    const store = configureStore({preloadedState: preloadedState as unknown as GlobalState, appReducers: {}, getAppReducers: () => {}});

    return store;
}

interface MockDispatch {
    (action: AnyAction): void;
    actions: AnyAction[];
}

// This should probably be replaced by redux-mock-store like the web app
export function mockDispatch(dispatch: (action: AnyAction) => void) {
    const mocked: MockDispatch = Object.assign((action: AnyAction) => {
        dispatch(action);

        mocked.actions.push(action);
    }, {actions: []});

    return mocked;
}
