// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';
import nock from 'nock';

import {ClientError, HEADER_X_VERSION_ID} from 'mattermost-redux/client/client4';
import TestHelper from 'mattermost-redux/test/test_helper';
import {isMinimumServerVersion} from 'mattermost-redux/utils/helpers';

import {rudderAnalytics, RudderTelemetryHandler} from './rudder';

jest.mock('rudder-sdk-js', () => {
    const original = jest.requireActual('rudder-sdk-js');

    return {
        ...original,
        track: jest.fn(),
    };
});

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
            const client = TestHelper.createClient4();

            assert.equal(client.serverVersion, '');

            nock(client.getBaseRoute()).
                get('/users/me').
                reply(200, '{}', {[HEADER_X_VERSION_ID]: '5.0.0.5.0.0.abc123'});

            await client.getMe();

            assert.equal(client.serverVersion, '5.0.0.5.0.0.abc123');
            assert.equal(isMinimumServerVersion(client.serverVersion, 5, 0, 0), true);
            assert.equal(isMinimumServerVersion(client.serverVersion, 5, 1, 0), false);

            nock(client.getBaseRoute()).
                get('/users/me').
                reply(200, '{}', {[HEADER_X_VERSION_ID]: '5.3.0.5.3.0.abc123'});

            await client.getMe();

            assert.equal(client.serverVersion, '5.3.0.5.3.0.abc123');
            assert.equal(isMinimumServerVersion(client.serverVersion, 5, 0, 0), true);
            assert.equal(isMinimumServerVersion(client.serverVersion, 5, 1, 0), true);
        });
    });

    describe('fetchWithGraphQL', () => {
        test('Should have correct graphql url', async () => {
            const client = TestHelper.createClient4();
            client.setUrl('http://community.mattermost.com');

            assert.equal(client.getGraphQLUrl(), 'http://community.mattermost.com/api/v5/graphql');
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

        assert.strictEqual(copy.message, error.message);
        assert.strictEqual(copy.intl, error.intl);
        assert.strictEqual(copy.server_error_id, error.server_error_id);
        assert.strictEqual(copy.status_code, error.status_code);
        assert.strictEqual(copy.url, error.url);
    });
});

describe('trackEvent', () => {
    it('should call Rudder\'s track when a RudderTelemetryHandler is attached to Client4', () => {
        const client = TestHelper.createClient4();

        client.trackEvent('test', 'onClick');

        expect(rudderAnalytics.track).not.toHaveBeenCalled();

        client.setTelemetryHandler(new RudderTelemetryHandler());
        client.trackEvent('test', 'onClick');

        expect(rudderAnalytics.track).toHaveBeenCalledTimes(1);
    });
});
