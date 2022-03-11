// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import nock from 'nock';

import Client4, {HEADER_X_VERSION_ID} from './client4';
import {ClientError} from './error';
import {TelemetryHandler} from './telemetry';

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
            const client = new Client4();
            client.setUrl('https://example.com');

            expect(client.serverVersion).toEqual('');

            nock(client.getBaseRoute()).
                get('/users/me').
                reply(200, '{}', {[HEADER_X_VERSION_ID]: '5.0.0.5.0.0.abc123'});

            await client.getMe();

            expect(client.serverVersion).toEqual('5.0.0.5.0.0.abc123');

            nock(client.getBaseRoute()).
                get('/users/me').
                reply(200, '{}', {[HEADER_X_VERSION_ID]: '5.3.0.5.3.0.abc123'});

            await client.getMe();

            expect(client.serverVersion).toEqual('5.3.0.5.3.0.abc123');
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

describe('trackEvent', () => {
    class TestTelemetryHandler implements TelemetryHandler {
        trackEvent = jest.fn();
        pageVisited = jest.fn();
    }

    it('should call the attached TelemetryHandler, if one is attached to Client4', () => {
        const client = new Client4();
        client.setUrl('https://example.com');

        expect(() => client.trackEvent('test', 'onClick')).not.toThrowError();

        const handler = new TestTelemetryHandler();

        client.setTelemetryHandler(handler);
        client.trackEvent('test', 'onClick');

        expect(handler.trackEvent).toHaveBeenCalledTimes(1);
    });
});
