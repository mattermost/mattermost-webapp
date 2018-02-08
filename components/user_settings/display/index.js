// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import UserSettingsDisplay from './user_settings_display.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const allowCustomThemes = config.AllowCustomThemes === 'true';
    const enableLinkPreviews = config.EnableLinkPreviews === 'true';
    const defaultClientLocale = config.DefaultClientLocale;
    const enableThemeSelection = config.EnableThemeSelection === 'true';

    return {
        ...ownProps,
        allowCustomThemes,
        enableLinkPreviews,
        defaultClientLocale,
        enableThemeSelection
    };
}

export default connect(mapStateToProps)(UserSettingsDisplay);
