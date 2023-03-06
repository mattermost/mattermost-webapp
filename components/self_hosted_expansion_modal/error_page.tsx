// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import PaymentFailedSvg from 'components/common/svg_images_components/payment_failed_svg';
import IconMessage from 'components/purchase_modal/icon_message';

export default function ErrorPage() {
    const contactSupportLink = useSelector(getCloudContactUsLink)(InquiryType.Technical);
    const formattedTitle = (
        <FormattedMessage
            id='admin.billing.subscription.paymentVerificationFailed'
            defaultMessage='Sorry, the payment verification failed'
        />
    );

    const formattedButtonText = (
        <FormattedMessage
            id='self_hosted_expansion.retry'
            defaultMessage='Try again'
        />
    );

    const formattedSubtitle = (
        <FormattedMessage
            id='admin.billing.subscription.paymentFailed'
            defaultMessage='Payment failed. Please try again or contact support.'
        />
    );

    const icon = (
        <PaymentFailedSvg
            width={444}
            height={313}
        />
    );

    return (
        <div className='failed'>
            <IconMessage
                formattedTitle={formattedTitle}
                formattedSubtitle={formattedSubtitle}
                icon={icon}
                error={true}
                formattedButtonText={formattedButtonText}
                buttonHandler={() => {}}
                formattedLinkText={
                    <a
                        href={contactSupportLink}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <FormattedMessage
                            id='admin.billing.subscription.privateCloudCard.contactSupport'
                            defaultMessage='Contact Support'
                        />
                    </a>
                }
            />
        </div>
    );
}
