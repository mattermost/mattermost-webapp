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
    timeZone?: string | null | undefined;

    /*
     * Enable timezone feature
     */
    enableTimezone?: boolean;
}

type FormattedTimeResult = {
    isoDate: string;
    time: string;
};

export default class LocalDateTime extends React.PureComponent<Props> {
    private getFormattedTime: () => FormattedTimeResult = () => {
        const {
            enableTimezone,
            eventTime,
            timeZone,
            useMilitaryTime,
        } = this.props;

        const momentDate = eventTime ? moment(eventTime) : moment();
        const format = useMilitaryTime ? 'HH:mm' : 'hh:mm A';

        let withTimezone;
        if (enableTimezone && timeZone) {
            momentDate.tz(timeZone);
            withTimezone = momentDate.toString() + ' (' + momentDate.tz() + ')';
        }

        return {
            isoDate: withTimezone || momentDate.toString(),
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
