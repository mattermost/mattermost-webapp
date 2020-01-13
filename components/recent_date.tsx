// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {
    DateSource,
    FormattedMessage,
    injectIntl,
} from 'react-intl';
import moment from 'moment-timezone';

type Props = {
    timeZone?: string;
    value: DateSource;
    children?(val: string): React.ReactElement | null;
    intl: any; // TODO This needs to be replaced with IntlShape once react-intl is upgraded
}

class RecentDate extends React.PureComponent<Props> {
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

        const options = {
            timeZone,
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        };
        const formattedDate = this.props.intl.formatDate(value, options);

        // `formatDate` returns unformatted date string on error like in the case of (react-intl) unsupported timezone.
        // Therefore, use react-intl by default or moment-timezone for unsupported timezone.
        if (formattedDate !== String(date)) {
            return formattedDate;
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

export default injectIntl(RecentDate);
