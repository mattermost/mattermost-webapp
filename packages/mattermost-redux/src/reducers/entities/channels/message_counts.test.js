// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {updateMessageCount} from './message_counts';

describe('reducers.entities.channels', () => {
    describe('updateMessageCounts', () => {
        it('root and total should be different if there are threads', () => {
            const state = {
                myid: {
                    total: 0,
                    root: 0,
                },
            };
            const channel = {
                id: 'myid',
                total_msg_count_root: 1,
                total_msg_count: 5,
            };
            const results = updateMessageCount(state, channel);
            assert.equal(results.myid.root, 1);
            assert.equal(results.myid.total, 5);
        });
    });
});
