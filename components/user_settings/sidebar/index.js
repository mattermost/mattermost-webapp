// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getSidebarPreferences} from 'mattermost-redux/selectors/entities/sidebar';

import UserSettingsSidebar from './user_settings_sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = getPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'close_unused_direct_messages',
        'after_seven_days'
    );

    let sidebarPreference = getSidebarPreferences(state);
    sidebarPreference = {
        ...sidebarPreference,
        unreadsAtTop: sidebarPreference.unreads_at_top,
        favoriteAtTop: sidebarPreference.favorite_at_top,
    };

    return {
        closeUnusedDirectMessages,
        sidebarPreference,
        showSidebarChannelPreference: config.ExperimentalSidebarPreference === 'true',
        showUnusedOption: config.CloseUnusedDirectMessages === 'true',
        user: getCurrentUser(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsSidebar);
