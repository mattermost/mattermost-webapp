// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {
    FormattedMessage,
    FormattedRelativeTime,
    injectIntl,
    IntlShape,
} from 'react-intl';
import moment from 'moment-timezone';

type Props = {
    timeZone?: string;
    value: number | Date;
    children?(val: string): React.ReactElement | null;
    intl: IntlShape;
    useTitleCase?: boolean;
    dateTimeFormat?: Intl.DateTimeFormatOptions;
}

class RecentDate extends React.PureComponent<Props> {
    public render() {
        const {
            value,
            timeZone,
            useTitleCase = true,
            dateTimeFormat,
            intl
        } = this.props;
        const date = new Date(value);

        const {is} = fromNow(date);

        if (dateTimeFormat == null) {
            if (useTitleCase && is.today) {
                return (
                    <FormattedMessage
                        id='date_separator.today'
                        defaultMessage='Today'
                    />
                );
            } else if (useTitleCase && is.yesterday) {
                return (
                    <FormattedMessage
                        id='date_separator.yesterday'
                        defaultMessage='Yesterday'
                    />
                );
            } else if (!useTitleCase && is.today) {
                return (
                    <FormattedRelativeTime
                        value={0}
                        unit='day'
                        numeric='auto'
                    />
                );
            } else if (!useTitleCase && is.yesterday) {
                return (
                    <FormattedRelativeTime
                        value={-1}
                        unit='day'
                        numeric='auto'
                    />
                );
            }
        }

        const options: Intl.DateTimeFormatOptions = dateTimeFormat ?? (
            is.withinPastSixDays ? {
                weekday: 'long'
            } : {
                day: '2-digit',
                month: 'long',
                ...is.sameYear ? {

                } : {
                    year: 'numeric'
                }
            }
        );

        const formattedDate = intl.formatDate(value, {timeZone, ...options});

        // On error, `formatDate` returns unformatted date or value string like in the case of (react-intl) unsupported timezone.
        // Therefore, use react-intl by default or moment-timezone for unsupported timezone.
        if (formattedDate !== String(date) && formattedDate !== String(value)) {
            return formattedDate;
        }

        const momentDate = value ? moment(value) : moment();

        if (timeZone) {
            momentDate.tz(timeZone);
        }

        return momentDate.format('ddd, MMM D, YYYY');
    }
}

function fromNow(a: Date) {
    const now = new Date();
    const today = isSameDay(a, now);

    return {
        is: {
            today,
            yesterday: isYesterday(a),
            withinPastSixDays: moment(a).startOf('day').isAfter(moment(now).startOf('day').subtract(7, 'd')),
            sameMonth: today || isSameMonth(a, now),
            sameYear: today || isSameYear(a, now),
        }
    };
}

export function isSameDay(a: Date, b: Date = new Date()) {
    return a.getDate() === b.getDate() && isSameMonth(a, b);
}

export function isSameMonth(a: Date, b: Date) {
    return a.getMonth() === b.getMonth() && isSameYear(a, b);
}

export function isSameYear(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear();
}

export function isToday(date: Date) {
    return isSameDay(date);
}

export function isYesterday(date: Date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return isSameDay(date, yesterday);
}

export default injectIntl(RecentDate);
