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

    const hoursDiff = Duration.fromObject({
        minutes: profileUserDate.offset - currentUserDate.offset,
    }).as('hours');

    if (!hoursDiff) {
        return undefined;
    }

    const aheadOrBehind = hoursDiff > 0 ? 'ahead' : 'behind';

    if (aheadOrBehind === 'ahead') {
        return (
            <FormattedMessage
                id='user_profile.account.hoursAhead'
                defaultMessage='({hourDiff} hr. ahead)'
                values={{
                    hourDiff: Math.abs(hoursDiff),
                }}
            />
        );
    }

    return (
        <FormattedMessage
            id='user_profile.account.hoursBehind'
            defaultMessage='({hourDiff} hr. behind)'
            values={{
                hourDiff: Math.abs(hoursDiff),
            }}
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
            <span className='user-popover__subtitle' >
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
