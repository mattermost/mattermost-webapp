// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {buildQueryString, isMinimumServerVersion} from 'mattermost-redux/utils/helpers_client';

describe('Helpers', () => {
    it('isMinimumServerVersion', () => {
        assert.ok(isMinimumServerVersion('1.0.0', 1, 0, 0));
        assert.ok(isMinimumServerVersion('1.1.1', 1, 1, 1));
        assert.ok(!isMinimumServerVersion('1.0.0', 2, 0, 0));
        assert.ok(isMinimumServerVersion('4.6', 2, 0, 0));
        assert.ok(!isMinimumServerVersion('4.6', 4, 7, 0));
        assert.ok(isMinimumServerVersion('4.6.1', 2, 0, 0));
        assert.ok(isMinimumServerVersion('4.7.1', 4, 6, 2));
        assert.ok(!isMinimumServerVersion('4.6.1', 4, 6, 2));
        assert.ok(!isMinimumServerVersion('3.6.1', 4, 6, 2));
        assert.ok(isMinimumServerVersion('4.6.1', 3, 7, 2));
        assert.ok(isMinimumServerVersion('5', 4, 6, 2));
        assert.ok(isMinimumServerVersion('5', 5));
        assert.ok(isMinimumServerVersion('5.1', 5));
        assert.ok(isMinimumServerVersion('5.1', 5, 1));
        assert.ok(!isMinimumServerVersion('5.1', 5, 2));
        assert.ok(isMinimumServerVersion('5.1.0', 5));
        assert.ok(isMinimumServerVersion('5.1.1', 5, 1, 1));
        assert.ok(!isMinimumServerVersion('5.1.1', 5, 1, 2));
        assert.ok(isMinimumServerVersion('4.6.2.sakjdgaksfg', 4, 6, 2));
    });

    it('buildQueryString', () => {
        assert.equal(buildQueryString({}), '');
        assert.equal(buildQueryString({a: 1}), '?a=1');
        assert.equal(buildQueryString({a: 1, b: 'str'}), '?a=1&b=str');
    });
});
