// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {UserTimezone} from 'mattermost-redux/types/users';

import {areTimezonesEnabledAndSupported} from 'selectors/general';

import {GlobalState} from 'types/store';

import {Preferences} from 'utils/constants';

import Timestamp, {RangeDescriptor, supportsHourCycle} from './timestamp';

type Props = {
    userTimezone?: UserTimezone;
}

function mapStateToProps(state: GlobalState, {userTimezone}: Props) {
    const currentUserId = getCurrentUserId(state);

    let timeZone;
    let hourCycle;
    let hour12;

    if (areTimezonesEnabledAndSupported(state)) {
        timeZone = getUserCurrentTimezone(userTimezone ?? getUserTimezone(state, currentUserId)) ?? undefined;
    }

    const useMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);

    if (supportsHourCycle) {
        hourCycle = useMilitaryTime ? 'h23' : 'h12';
    } else {
        hour12 = !useMilitaryTime;
    }

    return {timeZone, hourCycle, hour12};
}

export default connect(mapStateToProps)(Timestamp);

export {default as SemanticTime} from './semantic_time';

export const RelativeRanges: {[key: string]: RangeDescriptor} = {
    TODAY_YESTERDAY: {
        within: ['day', -1],
        display: ['day']
    },
    TODAY_TITLE_CASE: {
        equals: ['day', 0],
        display: (
            <FormattedMessage
                id='date_separator.today'
                defaultMessage='Today'
            />
        ),
    },
    YESTERDAY_TITLE_CASE: {
        equals: ['day', -1],
        display: (
            <FormattedMessage
                id='date_separator.yesterday'
                defaultMessage='Yesterday'
            />
        ),
    },
};
