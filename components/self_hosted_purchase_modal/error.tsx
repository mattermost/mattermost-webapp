// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import PaymentFailedSvg from 'components/common/svg_images_components/payment_failed_svg';
import IconMessage from 'components/purchase_modal/icon_message';

import {CloudLinks} from 'utils/constants';

interface Props {
    nextAction: () => void;
    canRetry: boolean;
    errorType: 'failed_export' | 'generic';
}

export default function ErrorPage(props: Props) {
    const contactSupportLink = useSelector(getCloudContactUsLink)(InquiryType.Technical);
    const formattedTitle = (
        <FormattedMessage
            id='admin.billing.subscription.paymentVerificationFailed'
            defaultMessage='Sorry, the payment verification failed'
        />
    );
    let formattedButtonText = (
        <FormattedMessage
            id='self_hosted_signup.retry'
            defaultMessage='Try again'
        />
    );

    if (!props.canRetry) {
        formattedButtonText = (
            <FormattedMessage
                id='self_hosted_signup.close'
                defaultMessage='Close'
            />
        );
    }

    let formattedSubtitle = (
        <FormattedMessage
            id='admin.billing.subscription.paymentFailed'
            defaultMessage='Payment failed. Please try again or contact support.'
        />
    );

    if (props.errorType === 'failed_export') {
        formattedSubtitle = (
            <FormattedMessage
                id='self_hosted_signup.failed_export.subtitle'
                defaultMessage='Payment failed. Please contact support or try signing up at <a>{link}</a>.'
                values={{
                    a: (chunks: React.ReactNode) => (
                        <a href={CloudLinks.SELF_HOSTED_PRICING}>{chunks}</a>
                    ),
                    link: CloudLinks.SELF_HOSTED_PRICING,
                }}
            />
        );
    }

    return (
        <div className='failed'>
            <IconMessage
                formattedTitle={formattedTitle}
                formattedSubtitle={formattedSubtitle}
                icon={(
                    <PaymentFailedSvg
                        width={444}
                        height={313}
                    />
                )}
                error={true}
                formattedButtonText={formattedButtonText}
                buttonHandler={props.nextAction}
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
