// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {equalServerVersions} from 'utils/server_version.jsx';

describe('utils/server_version/equalServerVersions', () => {
    test('should handle undefined values', () => {
        const a = undefined; // eslint-disable-line no-undefined
        const b = null;
        expect(equalServerVersions(a, b)).toEqual(true);
    });

    test('should consider two empty versions as equal', () => {
        const a = '';
        const b = '';
        expect(equalServerVersions(a, b)).toEqual(true);
    });

    test('should consider different strings without components as equal', () => {
        const a = 'not a server version';
        const b = 'also not a server version';
        expect(equalServerVersions(a, b)).toEqual(true);
    });

    test('should consider different malformed versions as equal ignoring the last two components', () => {
        const a = '1.2.3';
        const b = '1.2.4';
        expect(equalServerVersions(a, b)).toEqual(true);
    });

    test('should consider an empty version different from a non-empty one', () => {
        const a = '';
        const b = '4.7.1.dev.c51676437bc02ada78f3a0a0a2203c60.true';
        expect(equalServerVersions(a, b)).toEqual(false);
    });

    test('should consider the same versions equal', () => {
        const a = '4.7.1.dev.c51676437bc02ada78f3a0a0a2203c60.true';
        const b = '4.7.1.dev.c51676437bc02ada78f3a0a0a2203c60.true';
        expect(equalServerVersions(a, b)).toEqual(true);
    });

    test('should consider different release versions unequal', () => {
        const a = '4.7.0.12.c51676437bc02ada78f3a0a0a2203c60.true';
        const b = '4.7.1.12.c51676437bc02ada78f3a0a0a2203c60.true';
        expect(equalServerVersions(a, b)).toEqual(false);
    });

    test('should consider different build numbers unequal', () => {
        const a = '4.7.1.12.c51676437bc02ada78f3a0a0a2203c60.true';
        const b = '4.7.1.13.c51676437bc02ada78f3a0a0a2203c60.true';
        expect(equalServerVersions(a, b)).toEqual(false);
    });

    test('should ignore different config hashes', () => {
        const a = '4.7.1.12.c51676437bc02ada78f3a0a0a2203c60.true';
        const b = '4.7.1.12.c51676437bc02ada78f3a0a0a2203c61.true';
        expect(equalServerVersions(a, b)).toEqual(true);
    });

    test('should ignore different licensed statuses', () => {
        const a = '4.7.1.12.c51676437bc02ada78f3a0a0a2203c60.false';
        const b = '4.7.1.12.c51676437bc02ada78f3a0a0a2203c60.true';
        expect(equalServerVersions(a, b)).toEqual(true);
    });
});
