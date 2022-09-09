// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

jest.mock('redux-persist', () => {
    const {combineReducers} = require('redux');

    return {
        createTransform: () => {
            return {};
        },
        persistReducer: (persistConfig, reducer) => reducer,
        persistCombineReducers: (persistConfig, reducers) => combineReducers(reducers),
        persistStore: () => {
            return {
                pause: () => {},
                purge: () => Promise.resolve(),
                resume: () => {},
            };
        },
    };
});
