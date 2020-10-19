// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedDate, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import classNames from 'classnames';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {trackEvent} from 'actions/telemetry_actions';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';
import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store';
import {getMonthLong} from 'utils/i18n';
import {CloudLinks} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import './plan_details.scss';

const features = [
    localizeMessage('admin.billing.subscription.planDetails.features.10GBstoragePerUser', '10 GB storage per user'),
    localizeMessage('admin.billing.subscription.planDetails.features.99uptime', '99.0% uptime'),
    localizeMessage('admin.billing.subscription.planDetails.features.selfServiceDocumentation', 'Self-Service documentation and forum support'),
    localizeMessage('admin.billing.subscription.planDetails.features.mfaAuthentication', 'Google, Gitlab, O365 & MFA Authentication'),
    localizeMessage('admin.billing.subscription.planDetails.features.guestAccounts', 'Guest Accounts'),
    localizeMessage('admin.billing.subscription.planDetails.features.unlimitedIntegrations', 'Unlimited Integrations'),
];

const seatsAndSubscriptionDates = (locale: string, userCount: number, numberOfSeats: number, startDate: Date, endDate: Date) => {
    return (
        <div className='PlanDetails__seatsAndSubscriptionDates'>
            <div className='PlanDetails__seats'>
                <div className='PlanDetails__seats-total'>
                    <FormattedMarkdownMessage
                        id='admin.billing.subscription.planDetails.numberOfSeats'
                        defaultMessage='{numberOfSeats} seats'
                        values={{numberOfSeats}}
                    />
                </div>
                <div
                    className={classNames('PlanDetails__seats-registered', {
                        overLimit: userCount > numberOfSeats,
                    })}
                >
                    <FormattedMarkdownMessage
                        id='admin.billing.subscription.planDetails.numberOfSeatsRegistered'
                        defaultMessage='({userCount} currently registered)'
                        values={{userCount}}
                    />
                    {(userCount > numberOfSeats) &&
                        <OverlayTrigger
                            delayShow={500}
                            placement='bottom'
                            overlay={(
                                <Tooltip
                                    id='BillingSubscriptions__seatOverageTooltip'
                                    className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-left'
                                    positionLeft={390}
                                >
                                    <div className='BillingSubscriptions__tooltipTitle'>
                                        <FormattedMessage
                                            id='admin.billing.subscription.planDetails.seatCountOverages'
                                            defaultMessage='Seat count overages'
                                        />
                                    </div>
                                    <div className='BillingSubscriptions__tooltipMessage'>
                                        <FormattedMarkdownMessage
                                            id='admin.billing.subscription.planDetails.prolongedOverages'
                                            defaultMessage='Prolonged overages may result in additional charges.'
                                        />
                                        <a
                                            target='_new'
                                            rel='noopener noreferrer'
                                            href={CloudLinks.BILLING_DOCS}
                                            onClick={() => trackEvent('cloud_admin', 'click_how_billing_works', {screen: 'payment'})}
                                        >
                                            <FormattedMessage
                                                id='admin.billing.subscription.planDetails.howBillingWorks'
                                                defaultMessage='See how billing works'
                                            />
                                        </a>
                                    </div>
                                </Tooltip>
                            )}
                        >
                            <i className='icon-information-outline'/>
                        </OverlayTrigger>
                    }
                </div>
            </div>
            <div className='PlanDetails__subscriptionDate'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.startDate'
                    defaultMessage='Start Date: '
                />
                <FormattedDate
                    value={startDate}
                    day='numeric'
                    month={getMonthLong(locale)}
                    year='numeric'
                />
            </div>
            <div className='PlanDetails__subscriptionDate'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.endDate'
                    defaultMessage='End Date: '
                />
                <FormattedDate
                    value={endDate}
                    day='numeric'
                    month={getMonthLong(locale)}
                    year='numeric'
                />
            </div>
        </div>
    );
};

const PlanDetails: React.FC = () => {
    const locale = useSelector((state: GlobalState) => getCurrentLocale(state));
    const userCount = useSelector((state: GlobalState) => state.entities.admin.analytics!.TOTAL_USERS) as number;
    const userLimit = parseInt(useSelector((state: GlobalState) => getConfig(state).ExperimentalCloudUserLimit) || '0', 10);
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    if (!subscription || !product) {
        return null;
    }

    let planPricing;

    const showSeatsAndSubscriptionDates = false;
    let userCountDisplay;
    switch (subscription.is_paid_tier) {
    case 'false':
        planPricing = (
            <div className='PlanDetails__plan'>
                <div className='PlanDetails__planName'>
                    <FormattedMessage
                        id='admin.billing.subscription.planDetails.tiers.free'
                        defaultMessage='Free'
                    />
                </div>
                <div className='PlanDetails__planCaveat'>
                    <FormattedMarkdownMessage
                        id='admin.billing.subscription.planDetails.upToXUsers'
                        defaultMessage='up to {userLimit} users'
                        values={{userLimit}}
                    />
                </div>
            </div>
        );
        userCountDisplay = (
            <div
                className={classNames('PlanDetails__userCount', {
                    withinLimit: (userLimit - userCount) <= 5,
                    overLimit: userCount > userLimit,
                })}
            >
                <FormattedMarkdownMessage
                    id='admin.billing.subscription.planDetails.userCountWithLimit'
                    defaultMessage='{userCount} / {userLimit} users'
                    values={{userCount, userLimit}}
                />
            </div>
        );
        break;
    case 'true':
        planPricing = (
            <div className='PlanDetails__plan'>
                <div className='PlanDetails__planName'>
                    {`$${product.price_per_seat.toFixed(2)}`}
                </div>
                <div className='PlanDetails__planCaveat'>
                    <FormattedMessage
                        id='admin.billing.subscription.planDetails.perUserPerMonth'
                        defaultMessage='/user/month'
                    />
                </div>
            </div>
        );
        userCountDisplay = (
            <div className='PlanDetails__userCount'>
                <FormattedMarkdownMessage
                    id='admin.billing.subscription.planDetails.userCount'
                    defaultMessage='{userCount} users'
                    values={{userCount}}
                />
            </div>
        );
        break;

    // case 'annual':
    //     planPricing = (
    //         <div className='PlanDetails__plan'>
    //             <div className='PlanDetails__planName'>
    //                 <FormattedMessage
    //                     id='admin.billing.subscription.planDetails.tiers.annual'
    //                     defaultMessage='Annual Subscription'
    //                 />
    //             </div>
    //         </div>
    //     );
    //     showSeatsAndSubscriptionDates = true;
    //     break;
    // case 'beta':
    //     planPricing = (
    //         <div className='PlanDetails__plan'>
    //             <div className='PlanDetails__planName'>
    //                 <FormattedMessage
    //                     id='admin.billing.subscription.planDetails.tiers.beta'
    //                     defaultMessage='Beta Subscription'
    //                 />
    //             </div>
    //         </div>
    //     );
    //     showSeatsAndSubscriptionDates = true;
    //     break;
    }

    const featureList = features.map((feature, i) => (
        <div
            key={`PlanDetails__feature${i}`}
            className='PlanDetails__feature'
        >
            <i className='icon-check'/>
            <span>{feature}</span>
        </div>
    ));

    return (
        <div className='PlanDetails'>
            <div className='PlanDetails__top'>
                <div className='PlanDetails__productName'>
                    {product.name}
                </div>
                {userCountDisplay}
            </div>
            {planPricing}
            {showSeatsAndSubscriptionDates && seatsAndSubscriptionDates(locale, userCount, subscription.seats, new Date(subscription.start_at), new Date(subscription.end_at))}
            <div className='PlanDetails__description'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.freeForTenUsers'
                    defaultMessage='Always free for up to 10 users'
                />
            </div>
            <div className='PlanDetails__teamAndChannelCount'>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.features.unlimitedTeamsAndChannels'
                    defaultMessage='Unlimited teams, channels, and search history'
                />
            </div>
            {featureList}
            <div className='PlanDetails__currentPlan'>
                <i className='icon-check-circle'/>
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.currentPlan'
                    defaultMessage='Current Plan'
                />
            </div>
        </div>
    );
};

export default PlanDetails;
