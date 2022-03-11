// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {buildQueryString} from './helpers';

describe('buildQueryString', () => {
    it('should return the correct values', () => {
        expect(buildQueryString({})).toEqual('');
        expect(buildQueryString({a: 1})).toEqual('?a=1');
        expect(buildQueryString({a: 1, b: 'str'})).toEqual('?a=1&b=str');
    });
});
