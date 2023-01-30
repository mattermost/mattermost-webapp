// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {t} from 'utils/i18n';

import {useIntl, FormattedMessage} from 'react-intl';

import AlertBanner from 'components/alert_banner';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';

import {SalesInquiryIssue} from 'selectors/cloud';
import {getSubscriptionProduct as selectSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {AnnouncementBarTypes, CloudProducts, RecurringIntervals} from 'utils/constants';

import './to_yearly_nudge_banner.scss';

const ToYearlyNudgeBannerDismissable = () => {
    const [show, setShow] = useState(true);

    const openPricingModal = useOpenPricingModal();

    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const product = useSelector(selectSubscriptionProduct);
    const currentProductProfessional = product?.sku === CloudProducts.PROFESSIONAL;
    const currentProductIsMonthly = product?.recurring_interval === RecurringIntervals.MONTH;
    const currentProductProMonthly = currentProductProfessional && currentProductIsMonthly;

    if (!show) {
        return null;
    }

    if (!isAdmin) {
        return null;
    }

    if (!currentProductProMonthly) {
        return null;
    }

    const message = {
        id: 'cloud_billing.nudge_to_yearly.announcement_bar',
        defaultMessage: 'Simplify your billing and switch to an annual plan today',
    };

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.ANNOUNCEMENT}
            showCloseButton={true}
            onButtonClick={() => openPricingModal({trackingLocation: 'to_yearly_nudge_annoucement_bar'})}
            modalButtonText={t('cloud_billing.nudge_to_yearly.learn_more')}
            modalButtonDefaultText='Learn more'
            message={<FormattedMessage {...message}/>}
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
    const currentProductProfessional = product?.sku === CloudProducts.PROFESSIONAL;
    const currentProductIsMonthly = product?.recurring_interval === RecurringIntervals.MONTH;
    const currentProductProMonthly = currentProductProfessional && currentProductIsMonthly;

    if (!currentProductProMonthly) {
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
