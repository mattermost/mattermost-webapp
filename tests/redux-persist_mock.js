// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

jest.mock('redux-persist', () => ({
    createTransform: () => {
        return {};
    },
    persistStore: () => {
        return {
            pause: () => {},
            purge: () => Promise.resolve(),
            resume: () => {},
        };
    },
}));
