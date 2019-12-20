// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage, DateSource} from 'react-intl';

type Props = {
    value: DateSource;
    children?(val: string): React.ReactElement | null;
}

export default class RecentDate extends React.PureComponent<Props> {
    public render() {
        const {value, ...otherProps} = this.props;
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

        return (
            <FormattedDate
                {...otherProps}
                value={value}
                weekday='short'
                month='short'
                day='2-digit'
                year='numeric'
            />
        );
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
