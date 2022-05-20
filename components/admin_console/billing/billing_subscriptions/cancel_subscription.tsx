// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

type Props = {
    cancelAccountLink: any;
    isFreeTrial: boolean;
    isPaidTier: boolean;
}

const CancelSubscription = (props: Props) => {
    const {
        cancelAccountLink,
        isFreeTrial,
        isPaidTier,
    } = props;

    if (isFreeTrial || !isPaidTier) {
        return null;
    }
    return (
        <div className='cancelSubscriptionSection'>
            <div className='cancelSubscriptionSection__text'>
                <div className='cancelSubscriptionSection__text-title'>
                    <FormattedMessage
                        id='admin.billing.subscription.cancelSubscriptionSection.title'
                        defaultMessage='Cancel your subscription'
                    />
                </div>
                <div className='cancelSubscriptionSection__text-description'>
                    <FormattedMessage
                        id='admin.billing.subscription.cancelSubscriptionSection.description'
                        defaultMessage='At this time, deleting a workspace can only be done with the help of a customer support representative.'
                    />
                </div>
                <a
                    href={cancelAccountLink}
                    rel='noopener noreferrer'
                    target='_blank'
                    className='cancelSubscriptionSection__contactUs'
                    onClick={() => trackEvent('cloud_admin', 'click_contact_us')}
                >
                    <FormattedMessage
                        id='admin.billing.subscription.cancelSubscriptionSection.contactUs'
                        defaultMessage='Contact Us'
                    />
                </a>
            </div>
        </div>
    );
};

export default CancelSubscription;
