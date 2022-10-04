// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {RawTimeZone, rawTimeZones} from '@vvo/tzdb';

import {UserTimezone} from '@mattermost/types/users';

import {findTimeZone} from './util';
import {DEFAULT_TIME_ZONE_NAME} from './constant';
import WorldMap from './world_map';

function findTimeZoneWithDefault(timeZoneName: string): RawTimeZone {
    const timezone = findTimeZone(timeZoneName);
    if (timezone) {
        return timezone;
    }

    const defaultTimezone = findTimeZone(DEFAULT_TIME_ZONE_NAME);
    if (defaultTimezone) {
        return defaultTimezone;
    }

    // Actually this would not happen. Just for TypeScript checking.
    return rawTimeZones[0];
}

export interface TimeZoneSelectMapProps {
    timeZoneName?: string;
    userStatus: string;
    userTimezone: UserTimezone;
}

const TimeZoneSelectMap = ({
    timeZoneName: givenTimeZoneName = DEFAULT_TIME_ZONE_NAME,
    userStatus,
    userTimezone,
}: TimeZoneSelectMapProps) => {
    // Sanitize the initial timezone.
    const initialTimeZoneName = findTimeZoneWithDefault(givenTimeZoneName).name;

    const [timeZoneName, setTimeZoneName] = React.useState(initialTimeZoneName);

    const handleTimeZoneChange = (newTimeZoneName: string) => {
        setTimeZoneName(newTimeZoneName);
    };

    return (
        <div className='TimeZoneSelectMap'>
            <WorldMap
                timeZoneName={timeZoneName}
                onChange={handleTimeZoneChange}
                userStatus={userStatus}
                userTimezone={userTimezone}
            />
        </div>
    );
};

export default TimeZoneSelectMap;
