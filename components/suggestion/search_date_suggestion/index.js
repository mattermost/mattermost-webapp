// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';

import {getCurrentDateForTimezone} from 'utils/timezone';
import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {getCurrentLocale} from 'selectors/i18n';

import SearchDateSuggestion from './search_date_suggestion.jsx';

function mapStateToProps(state) {
    const currentUserId = getCurrentUserId(state);
    const userTimezone = getUserTimezone(state, currentUserId);
    const locale = getCurrentLocale(state);

    const enableTimezone = areTimezonesEnabledAndSupported(state);

    let currentDate;
    if (enableTimezone) {
        if (userTimezone.useAutomaticTimezone) {
            currentDate = getCurrentDateForTimezone(userTimezone.automaticTimezone);
        } else {
            currentDate = getCurrentDateForTimezone(userTimezone.manualTimezone);
        }
    }

    return {
        currentDate,
        locale,
    };
}

export default connect(mapStateToProps)(SearchDateSuggestion);
