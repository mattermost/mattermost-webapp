// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from '@hmhealey/client';

import {rudderAnalytics, RudderTelemetryHandler} from './rudder';

jest.mock('rudder-sdk-js', () => {
    const original = jest.requireActual('rudder-sdk-js');

    return {
        ...original,
        track: jest.fn(),
    };
});

describe('RudderTelemetryHandler', () => {
    it('should call Rudder\'s track when a RudderTelemetryHandler is attached to Client4', () => {
        const client = new Client4();

        client.trackEvent('test', 'onClick');

        expect(rudderAnalytics.track).not.toHaveBeenCalled();

        client.setTelemetryHandler(new RudderTelemetryHandler());
        client.trackEvent('test', 'onClick');

        expect(rudderAnalytics.track).toHaveBeenCalledTimes(1);
    });
});
