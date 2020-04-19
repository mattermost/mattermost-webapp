// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {UserTimezone} from 'mattermost-redux/types/users';

import {areTimezonesEnabledAndSupported} from 'selectors/general';

import {GlobalState} from 'types/store';

import {Preferences} from 'utils/constants';

import LocalDateTime from './local_date_time';

type Props = {
    userTimezone: UserTimezone;
};

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const currentUserId = getCurrentUserId(state);

    let userTimezone;
    if (ownProps.userTimezone) {
        userTimezone = ownProps.userTimezone;
    } else {
        userTimezone = getUserTimezone(state, currentUserId);
    }

    return {
        enableTimezone: areTimezonesEnabledAndSupported(state),
        useMilitaryTime: getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false),
        timeZone: getUserCurrentTimezone(userTimezone),
    };
}

export default connect(mapStateToProps)(LocalDateTime);
