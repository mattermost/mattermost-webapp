// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {buildQueryString} from 'mattermost-redux/utils/helpers_client';

describe('Helpers', () => {
    it('buildQueryString', () => {
        assert.equal(buildQueryString({}), '');
        assert.equal(buildQueryString({a: 1}), '?a=1');
        assert.equal(buildQueryString({a: 1, b: 'str'}), '?a=1&b=str');
    });
});
