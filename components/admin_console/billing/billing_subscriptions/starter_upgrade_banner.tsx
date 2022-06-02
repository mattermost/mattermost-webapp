// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {openModal} from 'actions/views/modals';
import {trackEvent} from 'actions/telemetry_actions';

import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {SalesInquiryIssue} from 'selectors/cloud';

import {ModalIdentifiers, CloudProducts} from 'utils/constants';
import {anyUsageDeltaExceededLimit} from 'utils/limits';

import useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';

import PricingModal from 'components/pricing_modal';
import AlertBanner from 'components/alert_banner';

interface Props {
    planName: React.ReactNode;
    onDismiss: () => void;
}

const StarterUpgradeBanner = (props: Props) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const someLimitExceeded = anyUsageDeltaExceededLimit(useGetUsageDeltas());

    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const openSalesLink = useOpenSalesLink(SalesInquiryIssue.UpgradeEnterprise);
    if (!someLimitExceeded || subscriptionProduct?.sku !== CloudProducts.STARTER) {
        return null;
    }
    return (
        <AlertBanner
            mode='danger'
            title={
                <FormattedMessage
                    id='workspace_limits.banner_upgrade'
                    defaultMessage='Upgrade to one of our paid plans to avoid {planName} plan data limits'
                    values={{
                        planName: props.planName,
                    }}
                />
            }
            message={
                <FormattedMessage
                    id='workspace_limits.banner_upgrade_reason'
                    defaultMessage='Your workspace has exceeded {planName} plan data limits. Upgrade to one of our paid plans with no limits.'
                    values={{
                        planName: props.planName,
                    }}
                />
            }
            onDismiss={props.onDismiss}
        >
            <div>
                {subscriptionProduct.sku === CloudProducts.STARTER && (
                    <>
                        <button
                            onClick={() => {
                                trackEvent('cloud_admin', 'click_open_pricing_modal');
                                dispatch(openModal({
                                    modalId: ModalIdentifiers.PRICING_MODAL,
                                    dialogType: PricingModal,
                                }));
                            }}
                            className='btn btn-primary'
                        >
                            {intl.formatMessage({
                                id: 'workspace_limits.modals.view_plan_options',
                                defaultMessage: 'View plan options',
                            })}
                        </button>
                        <button
                            onClick={openSalesLink}
                            className='btn btn-secondary'
                        >
                            {intl.formatMessage({
                                id: 'admin.license.trialCard.contactSales',
                                defaultMessage: 'Contact sales',
                            })}
                        </button>
                    </>
                )}
            </div>
        </AlertBanner>
    );
};

export default StarterUpgradeBanner;
