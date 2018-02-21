// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import UserSettingsDisplay from './user_settings_display.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const allowCustomThemes = config.AllowCustomThemes === 'true';
    const enableLinkPreviews = config.EnableLinkPreviews === 'true';
    const defaultClientLocale = config.DefaultClientLocale;
    const enableThemeSelection = config.EnableThemeSelection === 'true';

    return {
        allowCustomThemes,
        enableLinkPreviews,
        defaultClientLocale,
        enableThemeSelection,
    };
}

export default connect(mapStateToProps)(UserSettingsDisplay);
