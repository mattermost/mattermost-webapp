// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {useIntl, FormattedMessage} from 'react-intl';

import AlertBanner from 'components/alert_banner';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';

import {SalesInquiryIssue} from 'selectors/cloud';
import {getSubscriptionProduct as selectSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';

import {AnnouncementBarTypes, RecurringIntervals} from 'utils/constants';

import './to_yearly_nudge_banner.scss';

const ToYearlyNudgeBannerDismissable = () => {
    const [show, setShow] = useState(true);

    const {formatMessage} = useIntl();

    const openPricingModal = useOpenPricingModal();

    const product = useSelector(selectSubscriptionProduct);
    const currentProductIsMonthly = product?.recurring_interval === RecurringIntervals.MONTH;

    if (!show && !currentProductIsMonthly) {
        return null;
    }

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.ANNOUNCEMENT}
            showCloseButton={true}
            onButtonClick={() => openPricingModal({trackingLocation: 'to_yearly_nudge_annoucement_bar'})}
            modalButtonText={formatMessage({id: 'cloud_billing.nudge_to_yearly.learn_more', defaultMessage: 'Learn more'})}
            message={formatMessage({id: 'cloud_billing.nudge_to_yearly.announcement_bar', defaultMessage: 'Simplify your billing and switch to an annual plan today'})}
            showLinkAsButton={true}
            handleClose={() => setShow(false)}
        />
    );
};

const ToYearlyNudgeBanner = () => {
    const {formatMessage} = useIntl();

    const openSalesLink = useOpenSalesLink(SalesInquiryIssue.AboutPurchasing);
    const openPricingModal = useOpenPricingModal();

    const product = useSelector(selectSubscriptionProduct);
    const currentProductIsMonthly = product?.recurring_interval === RecurringIntervals.MONTH;

    if (!currentProductIsMonthly) {
        return null;
    }

    const title = (
        <FormattedMessage
            id='cloud_billing.nudge_to_yearly.title'
            defaultMessage='Switch to an annual plan today'
        />
    );

    const description = (
        <FormattedMessage
            id='cloud_billing.nudge_to_yearly.description'
            defaultMessage='Simplify your billing by switching to an annual subscription.'
        />
    );

    const viewPlansAction = (
        <button
            onClick={() => openPricingModal({trackingLocation: 'to_yearly_nudge_banner'})}
            className='btn ToYearlyNudgeBanner__primary'
        >
            {formatMessage({id: 'cloud_billing.nudge_to_yearly.learn_more', defaultMessage: 'Learn more'})}
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

    return (
        <AlertBanner
            mode='info'
            title={title}
            message={description}
            className='ToYearlyNudgeBanner'
            actionButtonLeft={viewPlansAction}
            actionButtonRight={contactSalesAction}
        />
    );
};

export {
    ToYearlyNudgeBanner,
    ToYearlyNudgeBannerDismissable,
};
