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

        // Ideally, we'd use Intl.DateTimeFormatOptions, but hourCycle is not yet supported.
        // See https://github.com/microsoft/TypeScript/issues/34399
        const options: {
            hour?: string;
            minute?: string;
            timeZone?: string;
            hourCycle?: string;
        } = {
            hour: 'numeric',
            minute: 'numeric',
        };
        if (enableTimezone && timeZone) {
            options.timeZone = timeZone;
        }
        if (useMilitaryTime) {
            options.hourCycle = 'h23';
        } else {
            options.hourCycle = 'h12';
        }

        let formattedTime;
        try {
            formattedTime = (new Intl.DateTimeFormat(this.props.intl.locale, options)).format(date);
        } catch {
            // Fallback to Moment.js as a default rendering strategy. We could probably just
            // use `en-US` as a locale with Intl.DateTimeFormat as well.
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
