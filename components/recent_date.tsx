// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import moment from 'moment-timezone';

type Props = {
    timeZone?: string;
    value: number | Date;
    children?(val: string): React.ReactElement | null;
}

export default class RecentDate extends React.PureComponent<Props> {
    public render() {
        const {value, timeZone} = this.props;
        const date = new Date(value);

        if (isToday(date)) {
            return (
                <FormattedMessage
                    id='date_separator.today'
                    defaultMessage='Today'
                />
            );
        } else if (isYesterday(date)) {
            return (
                <FormattedMessage
                    id='date_separator.yesterday'
                    defaultMessage='Yesterday'
                />
            );
        }

        const momentDate = value ? moment(value) : moment();

        if (timeZone) {
            momentDate.tz(timeZone);
        }

        return momentDate.format('ddd, MMM D, YYYY');
    }
}

export function isSameDay(a: Date, b: Date) {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function isToday(date: Date) {
    const now = new Date();

    return isSameDay(date, now);
}

export function isYesterday(date: Date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return isSameDay(date, yesterday);
}
