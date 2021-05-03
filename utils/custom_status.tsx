// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import moment from 'moment-timezone';

import Timestamp, {RelativeRanges} from 'components/timestamp';

import {getCurrentDateAndTimeForTimezone} from './timezone';

const CUSTOM_STATUS_EXPIRY_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.TOMORROW_TITLE_CASE,
];

export function displayExpiryTime(time: string, timezone?: string) {
    const currentTime = timezone ? getCurrentDateAndTimeForTimezone(timezone) : new Date();
    const timestampProps: { [key: string]: any } = {
        value: time,
        ranges: CUSTOM_STATUS_EXPIRY_RANGES,
    };

    const currentMomentTime = moment(currentTime);
    if (moment(time).isSame(currentMomentTime.endOf('day')) || moment(time).isAfter(currentMomentTime.add(1, 'day').endOf('day'))) {
        timestampProps.useTime = false;
    }
    if (moment(time).isBefore(currentMomentTime.add(6, 'days'))) {
        timestampProps.useDate = {weekday: 'long'};
    }

    return (
        <Timestamp
            {...timestampProps}
        />
    );
}
