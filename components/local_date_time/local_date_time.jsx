// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedTime} from 'react-intl';

export default class LocalDateTime extends React.PureComponent {
    static propTypes = {

        /*
         * The time to display
         */
        eventTime: PropTypes.number,

        /*
         * Set to display using 24 hour format
         */
        useMilitaryTime: PropTypes.bool,

        /*
         * Current timezone of the user
         */
        timeZone: PropTypes.string,

        /*
         * Enable timezone feature
         */
        enableTimezone: PropTypes.bool,
    };

    render() {
        const {
            enableTimezone,
            eventTime,
            timeZone,
            useMilitaryTime,
        } = this.props;

        const date = eventTime ? new Date(eventTime) : new Date();

        const timezoneProps = enableTimezone && timeZone ? {timeZone} : {};

        return (
            <time
                className='post__time'
                dateTime={date.toISOString()}
                title={date}
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
