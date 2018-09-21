// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GroupUnreadChannels} from 'utils/constants.jsx';

import UserSettingsSidebar from './user_settings_sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        closeUnusedDirectMessages: getPreference(
            state,
            Preferences.CATEGORY_SIDEBAR_SETTINGS,
            'close_unused_direct_messages',
            'after_seven_days'
        ),
        displayUnreadSection: getPreference(
            state,
            Preferences.CATEGORY_SIDEBAR_SETTINGS,
            'show_unread_section',
            (config.ExperimentalGroupUnreadChannels === GroupUnreadChannels.DEFAULT_ON).toString()
        ),
        channelSwitcherOption: getPreference(
            state,
            Preferences.CATEGORY_SIDEBAR_SETTINGS,
            'channel_switcher_section',
            'true'
        ),
        showUnusedOption: config.CloseUnusedDirectMessages === 'true',
        showUnreadOption: config.ExperimentalGroupUnreadChannels !== GroupUnreadChannels.DISABLED,
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
