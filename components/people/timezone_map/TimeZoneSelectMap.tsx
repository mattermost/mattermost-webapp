// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {RawTimeZone, rawTimeZones} from '@vvo/tzdb';

import {findTimeZone} from './Util';
import {DEFAULT_TIME_ZONE_NAME} from './Constant';
import WorldMap from './WorldMap';

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
}

const TimeZoneSelectMap = ({
    timeZoneName: givenTimeZoneName = DEFAULT_TIME_ZONE_NAME,
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
            />
        </div>
    );
};

export default TimeZoneSelectMap;
