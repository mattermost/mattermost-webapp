// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage, FormattedNumber} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';
import {ItemStatus} from 'utils/constants';

import './seats_calculator.scss';

interface Props {
    price: number;
    seats: Seats;
    existingUsers: number;
    onChange: (seats: Seats) => void;
}

export interface Seats {
    quantity: string;
    error: React.ReactNode;
}

const MAX_TRANSACTION_VALUE = 1_000_000 - 1;
export function calculateMaxUsers(annualPricePerSeat: number): number {
    if (annualPricePerSeat === 0) {
        return Number.MAX_SAFE_INTEGER;
    }
    return Math.floor(MAX_TRANSACTION_VALUE / annualPricePerSeat);
}

export const errorInvalidNumber = (
    <FormattedMessage
        id='self_hosted_signup.error_invalid_number'
        defaultMessage='Enter a valid number of seats'
    />
);

function validateSeats(seats: string, annualPricePerSeat: number, minSeats: number): Seats {
    if (seats === '') {
        return {
            quantity: '',
            error: errorInvalidNumber,
        };
    }

    const seatsNumber = parseInt(seats, 10);
    if (!seatsNumber && seatsNumber !== 0) {
        return {
            quantity: seats,
            error: errorInvalidNumber,
        };
    }

    const maxSeats = calculateMaxUsers(annualPricePerSeat);
    const tooFewUsersErrorMessage = (
        <FormattedMessage
            id='self_hosted_signup.error_min_seats'
            defaultMessage='Your workspace currently has {num} users'
            values={{
                num: <FormattedNumber value={minSeats}/>,
            }}
        />
    );
    const tooManyUsersErrorMessage = (
        <FormattedMessage
            id='self_hosted_signup.error_max_seats'
            defaultMessage='Self-serve license purchase only supports purchases up to {num} users'
            values={{
                num: <FormattedNumber value={maxSeats}/>,
            }}
        />
    );

    if (seatsNumber < minSeats) {
        return {
            quantity: seats,
            error: tooFewUsersErrorMessage,
        };
    }

    if (seatsNumber > maxSeats) {
        return {
            quantity: seats,
            error: tooManyUsersErrorMessage,
        };
    }

    return {
        quantity: seats,
        error: null,
    };
}
const reDigits = /^[0-9]*$/;

export default function SeatsCalculator(props: Props) {
    const intl = useIntl();
    const annualPricePerSeat = props.price * 12;
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        const numValue = parseInt(value, 10);
        if ((value && !numValue && numValue !== 0) || !reDigits.test(value)) {
            return;
        }
        props.onChange(validateSeats(value, annualPricePerSeat, props.existingUsers));
    };

    const maxSeats = calculateMaxUsers(annualPricePerSeat);
    const total = '$' + intl.formatNumber((parseInt(props.seats.quantity, 10) || 0) * annualPricePerSeat, {maximumFractionDigits: 2});
    return (
        <div className='SeatsCalculator'>
            <div className='SeatsCalculator__table'>
                <div className='SeatsCalculator__seats-item'>
                    <div className='SeatsCalculator__seats-label'>
                        <Input
                            name='UserSeats'
                            type='text'
                            value={props.seats.quantity}
                            onChange={onChange}
                            placeholder={intl.formatMessage({id: 'self_hosted_signup.seats', defaultMessage: 'User seats'})}
                            wrapperClassName='user_seats'
                            inputClassName='user_seats'
                            maxLength={maxSeats.toString().length + 1}
                            customMessage={props.seats.error ? {
                                type: ItemStatus.ERROR,
                                value: props.seats.error,
                            } : null}
                            autoComplete='off'
                        />

                    </div>
                    <div className='SeatsCalculator__seats-value'>
                        {total}
                    </div>
                </div>
                <div className='SeatsCalculator__total'>
                    <div className='SeatsCalculator__total-label'>
                        <FormattedMessage
                            id='self_hosted_signup.total'
                            defaultMessage='Total'
                        />
                    </div>
                    <div className='SeatsCalculator__total-value'>
                        {total}
                    </div>
                </div>
            </div>
        </div>

    );
}
