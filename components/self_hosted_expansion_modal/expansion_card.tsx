// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {OutlinedInput} from '@mui/material';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import moment from 'moment-timezone';
import React, {Fragment, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import {getFilteredUsersStats} from 'mattermost-redux/selectors/entities/users';
import {DocLinks, RecurringIntervals} from 'utils/constants';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';
import './expansion_card.scss';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';

const MONTHS_IN_YEAR = 12;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_TRANSACTION_VALUE = 1_000_000 - 1;

interface Props {
    updateSeats: (seats: number) => void;
    submit: () => void;
    canSubmit: boolean;
}

export default function SelfHostedExpansionCard(props: Props) {
    const license = useSelector(getLicense)
    const startsAt = moment(parseInt(license.StartsAt)).format("MMM. D, YYYY");
    const endsAt = moment(parseInt(license.ExpiresAt)).format("MMM. D, YYYY");
    const licensedSeats = 100;//parseInt(license.Users);
    
    const activeUsers = 2;//useSelector(getFilteredUsersStats)?.total_users_count || 0;
    const [additionalSeats, setAdditionalSeats] = useState(activeUsers <= licensedSeats ? 1 : activeUsers - licensedSeats);
    const [overMaxSeats, setOverMaxSeats] = useState(false);
    const licenseExpiry = parseInt(license.ExpiresAt);
    const invalidAdditionalSeats = additionalSeats === 0 || isNaN(additionalSeats);

    const subscription = useSelector(getSubscriptionProduct);

    const getMonthsUntilExpiry = () => {
        const now = new Date();
        return Math.ceil((licenseExpiry - now.getTime()) / MILLISECONDS_PER_DAY / 30);
    }

    const getMonthlyPrice = () => {
        if (typeof subscription === "undefined") {
            return 0;
        }

        if(subscription?.recurring_interval === RecurringIntervals.MONTH) {
            return subscription.price_per_seat
        }

        const costPerMonth = (subscription.price_per_seat / MONTHS_IN_YEAR);

        // Only display 2 decimal places if the cost per month is not evenly divisible over 12 months.
        if (!Number.isInteger(costPerMonth)) {
            // Keep the return value as a number.
            return parseFloat(costPerMonth.toFixed(2));
        }

        return costPerMonth;
    }

    const getSubtotal = () => {
        const monthlyPrice = getMonthlyPrice();
        const monthsUntilExpiry = getMonthsUntilExpiry();
        if (isNaN(additionalSeats)) {
            return 0;
        }
        return additionalSeats * monthlyPrice * monthsUntilExpiry;
    }

    // Finds the maximum number of additional seats that is possible, taking into account
    // the stripe transaction limit. The maximum number of seats will follow the formula:
    // (StripeTransaction Limit - (Current_Seats * Price Per Seat)) / price_per_seat
    const getMaximumAdditionalSeats = () => {
        let recurringCost = 0;
        if (typeof subscription === "undefined") {
            return recurringCost;
        }

        // if monthly
        if (subscription.recurring_interval === RecurringIntervals.MONTH) {
            recurringCost = getMonthlyPrice();
        } else { // if yearly
            recurringCost = subscription.price_per_seat;
        }

        const currentPaymentPrice = recurringCost * licensedSeats;
        const remainingTransactionLimit = MAX_TRANSACTION_VALUE - currentPaymentPrice;
        const remainingSeats = Math.floor(remainingTransactionLimit / recurringCost);
        return Math.max(0, remainingSeats);
    }

    const maxAdditionalSeats = getMaximumAdditionalSeats();

    const handleNewSeatsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOverMaxSeats(false);
        const requestedSeats = parseInt(e.target.value);
        const overMaxAdditionalSeats = requestedSeats > maxAdditionalSeats;
        setOverMaxSeats(overMaxAdditionalSeats);
        const finalSeatCount = overMaxAdditionalSeats ? maxAdditionalSeats : requestedSeats;
        setAdditionalSeats(finalSeatCount);
        props.updateSeats(finalSeatCount);
    }

    return (
        <div className='SelfHostedExpansionRHSCard'>
            <div className='SelfHostedExpansionRHSCard__RHSCardTitle'>
                <FormattedMessage
                    id='self_hosted_expansion_rhs_license_summary_title'
                    defaultMessage='License Summary'
                />
            </div>
            <div className='SelfHostedExpansionRHSCard__Content'>
                <div className='SelfHostedExpansionRHSCard__PlanDetails'>
                    <span className='planName'>{license.SkuShortName}</span>
                    <div className='usage'>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_license_date'
                            defaultMessage='{startsAt} - {endsAt}'
                            values={{
                                startsAt,
                                endsAt,
                            }}
                        />
                        <br/>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_licensed_seats'
                            defaultMessage='{licensedSeats} LICENSES SEATS'
                            values={{
                                licensedSeats
                            }}
                        />
                    </div>
                </div>
                <hr/>
                <div className='SelfHostedExpansionRHSCard__seatInput'>
                    <FormattedMessage
                        id='self_hosted_expansion_rhs_card_add_new_seats'
                        defaultMessage='Add new seats'
                    />
                    <OutlinedInput
                        className='seatsInput'
                        size='small'
                        type='number'
                        value={additionalSeats}
                        onChange={handleNewSeatsInputChange}
                        error={invalidAdditionalSeats}
                        disabled={maxAdditionalSeats === 0}
                    />
                </div>
                <div className='SelfHostedExpansionRHSCard__AddSeatsWarning'>
                    {invalidAdditionalSeats && !overMaxSeats &&
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_must_add_seats_warning'
                            defaultMessage='{warningIcon} You must add a seat to continue'
                            values={{
                                warningIcon: <WarningIcon additionalClassName={'SelfHostedExpansionRHSCard__warning'}/>
                            }}
                        />
                    }
                    {overMaxSeats && maxAdditionalSeats > 0 &&
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_maximum_seats_warning'
                            defaultMessage='You may only expand by an additional {maxAdditionalSeats} seats'
                            values={{
                                maxAdditionalSeats
                            }}
                        />
                    }
                    {maxAdditionalSeats === 0 &&
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_additional_seats_limit_warning'
                            defaultMessage='You have reached the limit for additional seats'
                        />
                    }
                </div>
                <div className='SelfHostedExpansionRHSCard__cost_breakdown'>
                    <div className='costPerUser'>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_cost_per_user_title'
                            defaultMessage='Cost per user'
                        />
                        <br/>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_cost_per_user_breakdown'
                            defaultMessage='{costPerUser} x {monthsUntilExpiry} months'
                            values={{
                                costPerUser: getMonthlyPrice(),
                                monthsUntilExpiry: getMonthsUntilExpiry(),
                            }}
                        />
                    </div>
                    <div className='costAmount'>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_subtotal_cost'
                            defaultMessage='${subtotal}'
                            values={{
                                subtotal: getSubtotal()
                            }}
                        />
                    </div>
                    <div className='totalCost'>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_total_title'
                            defaultMessage='Total'
                        />
                        <br/>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_total_prorated_warning'
                            defaultMessage='The total will be prorated'
                        />
                    </div>
                    <div className='costAmount'>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_total_cost'
                            defaultMessage='${total}'
                            values={{
                                total: 0
                            }}
                        />
                    </div>
                </div>
                <button className='btn btn-primary SelfHostedExpansionRHSCard__CompletePurchaseButton' disabled={!props.canSubmit}>
                    <FormattedMessage
                        id='self_hosted_expansion_rhs_complete_button'
                        defaultMessage='Complete purchase'
                    />
                </button>
                <div className='SelfHostedExpansionRHSCard__ChargedTodayDisclaimer'>
                    <FormattedMessage
                        id='self_hosted_expansion_rhs_credit_card_charge_today_warning'
                        defaultMessage='Your credit card will be charged today.<see_how_billing_works>See how billing works.</see_how_billing_works>'
                        values={{
                            see_how_billing_works: (text: string) => (
                                <Fragment>
                                    <br/>
                                    <a
                                        href={DocLinks.SELF_HOSTED_BILLING}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        {text}
                                    </a>
                                </Fragment>
                            ),
                        }}
                    />
                </div>
            </div>
        </div>
    )
}   