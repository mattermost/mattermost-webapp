// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {OutlinedInput, Tooltip} from '@mui/material';

import moment from 'moment-timezone';
import React, {Fragment, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {DocLinks, RecurringIntervals, SelfHostedProducts} from 'utils/constants';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';

import './expansion_card.scss';
import useGetSelfHostedProducts from 'components/common/hooks/useGetSelfHostedProducts';
import {findSelfHostedProductBySku} from 'utils/hosted_customer';

const MONTHS_IN_YEAR = 12;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_TRANSACTION_VALUE = 1_000_000 - 1;

interface Props {
    canSubmit: boolean;
    licensedSeats: number;
    initialSeats: number;
    submit: () => void;
    updateSeats: (seats: number) => void;
}

export default function SelfHostedExpansionCard(props: Props) {
    const license = useSelector(getLicense);
    const startsAt = moment(parseInt(license.StartsAt)).format('MMM. D, YYYY');
    const endsAt = moment(parseInt(license.ExpiresAt)).format('MMM. D, YYYY');
    const [additionalSeats, setAdditionalSeats] = useState(props.initialSeats);
    const [overMaxSeats, setOverMaxSeats] = useState(false);
    const licenseExpiry = parseInt(license.ExpiresAt);
    const invalidAdditionalSeats = additionalSeats === 0 || isNaN(additionalSeats);
    const [products] = useGetSelfHostedProducts();
    const currentProduct = findSelfHostedProductBySku(products, license.SkuShortName);

    const getMonthsUntilExpiry = () => {
        const now = new Date();
        return Math.ceil((licenseExpiry - now.getTime()) / MILLISECONDS_PER_DAY / 30);
    };

    const getMonthlyPrice = () => {
        if (currentProduct === null) {
            return 0;
        }

        if (currentProduct?.recurring_interval === RecurringIntervals.MONTH) {
            return currentProduct.price_per_seat;
        }

        const costPerMonth = (currentProduct.price_per_seat / MONTHS_IN_YEAR);

        // Only display 2 decimal places if the cost per month is not evenly divisible over 12 months.
        if (!Number.isInteger(costPerMonth)) {
            // Keep the return value as a number.
            return costPerMonth;
        }

        return costPerMonth;
    };

    const getCostPerUser = () => {
        if (isNaN(additionalSeats)) {
            return 0;
        }
        const monthlyPrice = getMonthlyPrice();
        const monthsUntilExpiry = getMonthsUntilExpiry();
        return monthlyPrice * monthsUntilExpiry;
    }

    const getTotal = () => {
        if (isNaN(additionalSeats)) {
            return 0;
        }
        const monthlyPrice = getMonthlyPrice();
        const monthsUntilExpiry = getMonthsUntilExpiry();
        return additionalSeats * monthlyPrice * monthsUntilExpiry;
    };

    // Finds the maximum number of additional seats that is possible, taking into account
    // the stripe transaction limit. The maximum number of seats will follow the formula:
    // (StripeTransaction Limit - (Current_Seats * Price Per Seat)) / price_per_seat
    const getMaximumAdditionalSeats = () => {
        if (currentProduct === null) {
            return 0;
        }
        
        let recurringCost = 0;
        // if monthly
        if (currentProduct.recurring_interval === RecurringIntervals.MONTH) {
            recurringCost = getMonthlyPrice();
        } else { // if yearly
            recurringCost = currentProduct.price_per_seat;
        }

        const currentPaymentPrice = recurringCost * props.licensedSeats;
        const remainingTransactionLimit = MAX_TRANSACTION_VALUE - currentPaymentPrice;
        const remainingSeats = Math.floor(remainingTransactionLimit / recurringCost);
        return Math.max(0, remainingSeats);
    };

    const maxAdditionalSeats = getMaximumAdditionalSeats();

    const handleNewSeatsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOverMaxSeats(false);

        const requestedSeats = parseInt(e.target.value);

        const overMaxAdditionalSeats = requestedSeats > maxAdditionalSeats;
        setOverMaxSeats(overMaxAdditionalSeats);

        const finalSeatCount = overMaxAdditionalSeats ? maxAdditionalSeats : requestedSeats;
        setAdditionalSeats(finalSeatCount);

        props.updateSeats(finalSeatCount);
    };

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
                                licensedSeats: props.licensedSeats,
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
                                warningIcon: <WarningIcon additionalClassName={'SelfHostedExpansionRHSCard__warning'}/>,
                            }}
                        />
                    }
                    {overMaxSeats && maxAdditionalSeats > 0 &&
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_maximum_seats_warning'
                            defaultMessage='{warningIcon} You may only expand by an additional {maxAdditionalSeats} seats'
                            values={{
                                maxAdditionalSeats,
                                warningIcon: <WarningIcon additionalClassName={'SelfHostedExpansionRHSCard__warning'}/>,
                            }}
                        />
                    }
                    {maxAdditionalSeats === 0 &&
                        <Tooltip title={'test'}>
                            <FormattedMessage
                                id='self_hosted_expansion_rhs_card_additional_seats_limit_warning'
                                defaultMessage='{warningIcon} Transaction amount limit reached.{break}Please contact sales'
                                values={{
                                    break: <br/>,
                                    warningIcon: <WarningIcon additionalClassName={'SelfHostedExpansionRHSCard__warning'}/>,
                                }}
                            />
                        </Tooltip>
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
                                costPerUser: getMonthlyPrice().toFixed(2),
                                monthsUntilExpiry: getMonthsUntilExpiry(),
                            }}
                        />
                    </div>
                    <div className='costAmount'>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_subtotal_cost'
                            defaultMessage='${subtotal}'
                            values={{
                                subtotal: getCostPerUser().toFixed(2),
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
                    <span className='costAmount'>
                        <FormattedMessage
                            id='self_hosted_expansion_rhs_card_total_cost'
                            defaultMessage='${total}'
                            values={{
                                total: getTotal().toFixed(2),
                            }}
                        />
                    </span>
                </div>
                <button
                    className='btn btn-primary SelfHostedExpansionRHSCard__CompletePurchaseButton'
                    disabled={!props.canSubmit || maxAdditionalSeats === 0}
                    onClick={props.submit}
                >
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
    );
}
