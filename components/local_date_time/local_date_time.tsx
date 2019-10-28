// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedTime} from 'react-intl';
import moment from 'moment-timezone';

type Props = {

    /*
     * The time to display
     */
    eventTime?: number;

    /*
     * Set to display using 24 hour format
     */
    useMilitaryTime?: boolean;

    /*
     * Current timezone of the user
     */
    timeZone?: string;

    /*
     * Enable timezone feature
     */
    enableTimezone?: boolean;
}

export default class LocalDateTime extends React.PureComponent<Props> {
    public render() {
        const {
            enableTimezone,
            eventTime,
            timeZone,
            useMilitaryTime,
        } = this.props;

        const date = eventTime ? new Date(eventTime) : new Date();

        const titleMoment = moment(date);
        let titleString = titleMoment.toString();
        if (enableTimezone && timeZone) {
            titleMoment.tz(timeZone);
            titleString = titleMoment.toString() + ' (' + titleMoment.tz() + ')';
        }

        const timezoneProps = enableTimezone && timeZone ? {timeZone} : {};

        return (
            <time
                aria-label={date.toString()}
                className='post__time'
                dateTime={date.toISOString()}
                title={titleString}
                id='localDateTime'
            >
                <FormattedTime
                    {...timezoneProps}
                    hour12={!useMilitaryTime}
                    value={date}
                />
            </time>
        );
    }
}