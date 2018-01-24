// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getSupportedTimezones} from 'mattermost-redux/actions/general';
import {getConfig, getSupportedTimezones as getTimezones} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';

import UserSettingsDisplay from './user_settings_display.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const timezones = getTimezones(state);
    const currentUserId = getCurrentUserId(state);
    const userTimezone = getUserTimezone(state, currentUserId);

    const allowCustomThemes = config.AllowCustomThemes === 'true';
    const enableLinkPreviews = config.EnableLinkPreviews === 'true';
    const defaultClientLocale = config.DefaultClientLocale;
    const enableThemeSelection = config.EnableThemeSelection === 'true';
    const configTeammateNameDisplay = config.TeammateNameDisplay;

    return {
        allowCustomThemes,
        configTeammateNameDisplay,
        enableLinkPreviews,
        defaultClientLocale,
        enableThemeSelection,
        timezones,
        userTimezone,
        currentUserTimezone: getUserCurrentTimezone(userTimezone),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getSupportedTimezones,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsDisplay);
