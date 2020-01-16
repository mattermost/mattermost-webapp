// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl} from 'react-intl';
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

    intl: any; // TODO This needs to be replaced with IntlShape once react-intl is upgraded
}

class LocalDateTime extends React.PureComponent<Props> {
    public render() {
        const {
            enableTimezone,
            eventTime,
            timeZone,
            useMilitaryTime,
        } = this.props;

        const date = eventTime ? new Date(eventTime) : new Date();

        const momentDate = moment(date);
        let titleString = momentDate.toString();
        if (enableTimezone && timeZone) {
            momentDate.tz(timeZone);
            titleString = momentDate.toString() + ' (' + momentDate.tz() + ')';
        }

        const timezoneProps = enableTimezone && timeZone ? {timeZone} : {};
        const options = {
            ...timezoneProps,
            hour12: !useMilitaryTime,
        };
        let formattedTime = this.props.intl.formatTime(date, options);

        if (formattedTime === String(date)) {
            const format = useMilitaryTime ? 'HH:mm' : 'hh:mm A';
            formattedTime = momentDate.format(format);
        }

        return (
            <time
                aria-label={date.toString()}
                className='post__time'
                dateTime={date.toISOString()}
                title={titleString}
            >
                <span>{formattedTime}</span>
            </time>
        );
    }
}

export default injectIntl(LocalDateTime);
