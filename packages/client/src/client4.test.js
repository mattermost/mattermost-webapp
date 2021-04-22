// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import nock from 'nock';

import Client4, {ClientError, HEADER_X_VERSION_ID} from './client4';

describe('Client4', () => {
    beforeAll(() => {
        if (!nock.isActive()) {
            nock.activate();
        }
    });

    afterAll(() => {
        nock.restore();
    });

    describe('doFetchWithResponse', () => {
        it('serverVersion should be set from response header', async () => {
            const client = new Client4('http://example.mm.com');

            expect(client.serverVersion).toBe('');

            nock(client.getBaseRoute()).
                get('/users/me').
                reply(200, '{}', {[HEADER_X_VERSION_ID]: '5.0.0.5.0.0.abc123'});

            await client.getMe();

            expect(client.serverVersion).toBe('5.0.0.5.0.0.abc123');
            // expect(isMinimumServerVersion(client.serverVersion, 5, 0, 0)).toBe(true);
            // expect(isMinimumServerVersion(client.serverVersion, 5, 1, 0)).toBe(false);

            nock(client.getBaseRoute()).
                get('/users/me').
                reply(200, '{}', {[HEADER_X_VERSION_ID]: '5.3.0.5.3.0.abc123'});

            await client.getMe();

            expect(client.serverVersion).toBe('5.3.0.5.3.0.abc123');
            // expect(isMinimumServerVersion(client.serverVersion, 5, 0, 0)).toBe(true);
            // expect(isMinimumServerVersion(client.serverVersion, 5, 1, 0)).toBe(true);
        });
    });
});

describe('ClientError', () => {
    it('standard fields should be enumerable', () => {
        const error = new ClientError('https://example.com', {
            message: 'This is a message',
            intl: {
                id: 'test.error',
                defaultMessage: 'This is a message with a translation',
            },
            server_error_id: 'test.app_error',
            status_code: 418,
            url: 'https://example.com/api/v4/error',
        });

        const copy = {...error};

        expect(copy.message).toBe(error.message);
        expect(copy.intl).toBe(error.intl);
        expect(copy.server_error_id).toBe(error.server_error_id);
        expect(copy.status_code).toBe(error.status_code);
        expect(copy.url).toBe(error.url);
    });
});
