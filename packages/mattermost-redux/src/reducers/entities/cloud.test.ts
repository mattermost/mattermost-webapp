// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloudTypes} from 'mattermost-redux/action_types';

import {limits} from './cloud';

const minimalLimits = {
    messages: {
        history: 10000,
    },
};

describe('limits reducer', () => {
    test('returns empty limits by default', () => {
        expect(limits(undefined, {type: 'some action', data: minimalLimits})).toEqual({});
    });

    test('returns prior limits on unmatched action', () => {
        const unchangedLimits = limits(
            minimalLimits,
            {
                type: 'some action',
                data: {
                    minimalLimits,
                    integrations: {
                        enabled: 10,
                    },
                },
            },
        );
        expect(unchangedLimits).toEqual(minimalLimits);
    });

    test('returns new limits on RECEIVED_CLOUD_LIMITS', () => {
        const updatedLimits = {
            ...minimalLimits,
            integrations: {
                enabled: 10,
            },
        };
        const unchangedLimits = limits(
            minimalLimits,
            {
                type: CloudTypes.RECEIVED_CLOUD_LIMITS,
                data: updatedLimits,
            },
        );
        expect(unchangedLimits).toEqual(updatedLimits);
    });
});
