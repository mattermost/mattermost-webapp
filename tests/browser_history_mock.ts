// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

jest.mock('utils/browser_history', () => {
    const history = {
        length: -1,
        action: 'PUSH',
        location: {
            pathname: '/a-mocked-location',
            search: '',
            hash: '',
        },
        push: jest.fn(),
        replace: jest.fn(),
        go: jest.fn(),
        goBack: jest.fn(),
        goForward: jest.fn(),
        block: jest.fn(),
        listen: jest.fn(),
        createHref: jest.fn(),
    };

    return {
        getHistory: () => history,
    };
});

export {};
