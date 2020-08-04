// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FunctionComponent} from 'react';
import moment from 'moment-timezone';
import {Unit} from '@formatjs/intl-relativetimeformat';

import Timestamp from 'components/timestamp/timestamp';
type Props = {
    lastPostAt?: number;
}

export const LastPostAt: FunctionComponent<Props> = ({lastPostAt}: Props): JSX.Element | null => {
    if (!lastPostAt) {
        return null;
    }
    let unit: Unit;

    if (moment().diff(lastPostAt, 'years') > 0) {
        unit = 'year';
    } else if (moment().diff(lastPostAt, 'months') > 0) {
        unit = 'month';
    } else if (moment().diff(lastPostAt, 'days') > 0) {
        unit = 'day';
    } else if (moment().diff(lastPostAt, 'hours') > 0) {
        unit = 'hour';
    } else {
        unit = 'minute';
    }

    return (
        <div className='more-modal__last_post_at'>
            <Timestamp
                value={lastPostAt}
                useTime={false}
                unit={unit}
            />
        </div>
    );
};