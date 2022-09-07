// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SubscriptionResponse} from '@mattermost/types/cloud';

import {CloudTypes} from 'mattermost-redux/action_types';
import {TestHelper} from 'utils/test_helper';

import {limits, subscription} from './cloud';

const minimalLimits = {
    limitsLoaded: true,
    limits: {
        messages: {
            history: 10000,
        },
    },
};

describe('subscription reducer', () => {
    const baseSub: SubscriptionResponse = {
        id: 'id',
        customer_id: 'customer_id',
        product_id: 'product_id',
        add_ons: [],
        start_at: 0,
        end_at: 0,
        create_at: 0,
        seats: 0,
        trial_end_at: 0,
        is_free_trial: 'false',
        is_paid_tier: 'false',
    };
    const isLegacyCloudPaidTierTests = [
        {
            label: 'when not paid tier, has no is_legacy_cloud_paid_tier if not a legacy cloud plan',
            sub: baseSub,
            value: undefined,
        },
        {
            label: 'when not paid tier, has no is_legacy_cloud_paid_tier if a legacy cloud plan',
            sub: {...baseSub, product_id: 'prod_HyiHEAVKW5bYG3'},
            value: undefined,
        },
        {
            label: 'when paid tier, has no is_legacy_cloud_paid_tier if not a legacy cloud plan',
            sub: {baseSub, is_paid_tier: 'true'},
            value: undefined,
        },
        {
            label: 'when paid tier, has is_legacy_cloud_paid_tier if a legacy cloud plan',
            sub: {...baseSub, is_paid_tier: 'true', product_id: 'prod_HyiHEAVKW5bYG3'},
            value: true,
        },
    ];
    const type = CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION;
    isLegacyCloudPaidTierTests.forEach((t: typeof isLegacyCloudPaidTierTests[0]) => {
        test(t.label, () => {
            const newSub = subscription(null, {type, data: t.sub});
            expect(newSub?.is_legacy_cloud_paid_tier).toBe(t.value);
        });
    });

    it('when zero last_invoice, the invoice is ignored', () => {
        const sub = {...baseSub, last_invoice: TestHelper.getInvoiceMock({total: 0})};
        const newSub = subscription(null, {type: CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION, data: sub});
        expect(newSub!.last_invoice).toBe(undefined);
    });

    it('when non zero last_invoice, the invoice is saved in state', () => {
        const sub = {...baseSub, last_invoice: TestHelper.getInvoiceMock({total: 0.01})};
        const newSub = subscription(null, {type: CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION, data: sub});
        expect(newSub!.last_invoice!.total).toBe(0.01);
    });
});

describe('limits reducer', () => {
    test('returns empty limits by default', () => {
        expect(limits(undefined, {type: 'some action', data: minimalLimits})).toEqual({
            limits: {},
            limitsLoaded: false,
        });
    });

    test('returns prior limits on unmatched action', () => {
        const unchangedLimits = limits(
            minimalLimits,
            {
                type: 'some action',
                data: {
                    ...minimalLimits,
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
        expect(unchangedLimits).toEqual({limits: {...updatedLimits}, limitsLoaded: true});
    });
});
