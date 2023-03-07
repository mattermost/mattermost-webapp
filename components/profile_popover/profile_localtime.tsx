// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {DateTime, Duration} from 'luxon';

import {FormattedMessage} from 'react-intl';

import {UserTimezone} from '@mattermost/types/users';
import Timestamp from 'components/timestamp';

type ProfileTimezoneProps = {
    profileUserTimezone?: UserTimezone;
    currentUserTimezone: string | undefined;
}

const returnTimeDiff = (
    currentUserTimezone: string | undefined,
    profileUserTimezone: UserTimezone | undefined,
) => {
    if (!currentUserTimezone || !profileUserTimezone) {
        return undefined;
    }
    const currentUserDate = DateTime.local().setZone(currentUserTimezone);
    const profileUserDate = DateTime.local().setZone(profileUserTimezone?.manualTimezone || profileUserTimezone?.automaticTimezone);

    const offset = Duration.fromObject({
        hours: (profileUserDate.offset - currentUserDate.offset) / 60,
    });

    if (!offset.valueOf()) {
        return undefined;
    }

    const timeOffset = offset.toHuman({unitDisplay: 'short', signDisplay: 'never'});

    return offset.valueOf() > 0 ? (
        <FormattedMessage
            id='user_profile.account.hoursAhead'
            defaultMessage='({timeOffset} ahead)'
            values={{timeOffset}}
        />
    ) : (
        <FormattedMessage
            id='user_profile.account.hoursBehind'
            defaultMessage='({timeOffset} behind)'
            values={{timeOffset}}
        />
    );
};

const ProfileTimezone = (
    {
        currentUserTimezone,
        profileUserTimezone,
    }: ProfileTimezoneProps,
) => {
    const profileTimezone = profileUserTimezone?.manualTimezone || profileUserTimezone?.automaticTimezone;

    return (
        <div
            className='user-popover__time-status-container'
        >
            <span className='user-popover__subtitle'>
                <FormattedMessage
                    id='user_profile.account.localTime'
                    defaultMessage='Local Time {timezone}'
                    values={{
                        timezone: profileTimezone ? `(${DateTime.now().setZone(profileTimezone).offsetNameShort})` : '',
                    }}
                />
            </span>
            <span>
                <Timestamp
                    useRelative={false}
                    useDate={false}
                    userTimezone={profileUserTimezone}
                    useTime={{
                        hour: 'numeric',
                        minute: 'numeric',
                    }}
                />
                {' '}
                {returnTimeDiff(currentUserTimezone, profileUserTimezone)}
            </span>

        </div>
    );
};

export {
    ProfileTimezone,
};
