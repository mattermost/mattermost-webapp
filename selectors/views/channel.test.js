// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {makeGetChannelPostStatus, makeGetChannelSyncStatus} from './channel';

describe('modals selector', () => {
    const state = {
        views: {
            channel: {
                channelSyncStatus: {
                    channelId: true,
                },
                channelPostsStatus: {
                    channelId: {
                        atStart: true,
                        atEnd: true,
                    },
                },
            },
        },
    };

    it('makeGetChannelPostStatus should return true for channelId', () => {
        expect(makeGetChannelPostStatus()(state, 'channelId')).toEqual({
            atStart: true,
            atEnd: true,
        });
    });

    it('makeGetChannelSyncStatus should return true for channelId', () => {
        expect(makeGetChannelSyncStatus()(state, 'channelId')).toBeTruthy();
    });
});
