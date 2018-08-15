// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getIsBusy, getIsWebrtcOpen} from 'selectors/webrtc';

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

    test('getIsWebrtcOpen', () => {
        const state = {
            views: {
                webrtc: {
                    isOpen: false,
                },
            },
        };
        expect(getIsWebrtcOpen(state)).toBeFalsy();
    });
});
