// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import {useIntl, FormattedMessage} from 'react-intl';

import AlertBanner from 'components/alert_banner';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';

import {SalesInquiryIssue} from 'selectors/cloud';

import './to_yearly_nudge_banner.scss';

const ToYearlyNudgeBanner = () => {
    const [show, setShow] = useState(true);
    const {formatMessage} = useIntl();

    const openSalesLink = useOpenSalesLink(SalesInquiryIssue.AboutPurchasing);
    const openPricingModal = useOpenPricingModal();

    const title = (
        <FormattedMessage
            id='cloud_billing.nudge_to_yearly.title'
            defaultMessage='Switch to the annual plan'
        />
    );

    const description = (
        <FormattedMessage
            id='cloud_billing.nudge_to_yearly.description'
            defaultMessage='Please switch to the annual plan. However, your current monthly subscription will remain supported.'
        />
    );

    const viewPlansAction = (
        <button
            onClick={() => openPricingModal({trackingLocation: 'to_yearly_nudge_banner'})}
            className='btn ToYearlyNudgeBanner__primary'
        >
            {formatMessage({id: 'cloud_billing.nudge_to_yearly.view_plans', defaultMessage: 'View Plans'})}
        </button>
    );

    const contactSalesAction = (
        <button
            onClick={openSalesLink}
            className='btn ToYearlyNudgeBanner__secondary'
        >
            {formatMessage({id: 'cloud_billing.nudge_to_yearly.contact_sales', defaultMessage: 'Contact sales'})}
        </button>
    );

    if (!show) {
        return null;
    }

    return (
        <AlertBanner
            mode='info'
            title={title}
            message={description}
            onDismiss={() => setShow(false)}
            className='ToYearlyNudgeBanner'
            actionButtonLeft={viewPlansAction}
            actionButtonRight={contactSalesAction}
        />
    );
};

export default ToYearlyNudgeBanner;
