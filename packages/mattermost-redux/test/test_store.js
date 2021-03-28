// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {AsyncNodeStorage} from 'redux-persist-node-storage';
import {createTransform, persistStore} from 'redux-persist';

import configureStore from 'mattermost-redux/store';

export default function testConfigureStore(preloadedState) {
    const storageTransform = createTransform(
        () => ({}),
        () => ({}),
    );

    const persistConfig = {
        persist: (store, options) => {
            return persistStore(store, {storage: new AsyncNodeStorage('./.tmp'), ...options});
        },
        persistOptions: {
            debounce: 1000,
            transforms: [
                storageTransform,
            ],
            whitelist: [],
        },
    };

    const store = configureStore(preloadedState, {}, persistConfig, () => ({}));

    return store;
}

// This should probably be replaced by redux-mock-store like the web app
export function mockDispatch(dispatch) {
    const mocked = (action) => {
        dispatch(action);

        mocked.actions.push(action);
    };

    mocked.actions = [];

    return mocked;
}
