// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
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
    getFormattedTime = () => {
        const {
            enableTimezone,
            eventTime,
            timeZone,
            useMilitaryTime,
        } = this.props;

        const value = eventTime ? new Date(eventTime) : new Date();
        const momentDate = moment(value);
        const format = useMilitaryTime ? 'HH:mm' : 'hh:mm A';

        if (enableTimezone && timeZone) {
            momentDate.tz(timeZone);

            return {
                isoDate: momentDate.toString() + ' (' + momentDate.tz() + ')',
                time: moment.tz(value, timeZone).format(format),
            };
        }

        return {
            isoDate: momentDate.toString(),
            time: momentDate.format(format),
        };
    };

    public render() {
        const {isoDate, time} = this.getFormattedTime();

        return (
            <time
                aria-label={isoDate}
                className='post__time'
                dateTime={isoDate}
                title={isoDate}
            >
                <span>{time}</span>
            </time>
        );
    }
}
