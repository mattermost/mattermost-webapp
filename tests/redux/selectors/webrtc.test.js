// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getIsBusy} from 'selectors/webrtc';

describe('webrtc selector', () => {
    test('getIsBusy', () => {
        const state = {
            views: {
                webrtc: {
                    isBusy: false,
                },
            },
        };
        expect(getIsBusy(state)).toBeFalsy();
    });
});
