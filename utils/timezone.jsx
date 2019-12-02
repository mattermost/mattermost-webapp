// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getSupportedTimezones as getTimezones} from 'mattermost-redux/selectors/entities/general';
import moment from 'moment-timezone';

import store from 'stores/redux_store.jsx';

// In user_settings the state is being passed here.
// In timezone_provider it is not.
// Not sure how to refactor the timezone_provider yet.
export function getSupportedTimezones(state = store.getState()) {
    return getTimezones(state);
}

export function getBrowserTimezone() {
    return moment.tz.guess();
}

export function getBrowserUtcOffset() {
    return moment().utcOffset();
}

export function getUtcOffsetForTimeZone(timezone) {
    return moment.tz(timezone).utcOffset();
}
