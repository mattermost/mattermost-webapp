// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get as getPreference, getSidebarPreferences, getNewSidebarPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';

import UserSettingsSidebar from './user_settings_sidebar';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const closeUnusedDirectMessages = getPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'close_unused_direct_messages',
        'after_seven_days',
    );

    const channelSwitcherOption = getPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'channel_switcher_section',
        'true',
    );

    const channelSidebarOrganizationOption = getNewSidebarPreference(state);
    const sidebarPreference = getSidebarPreferences(state);

    return {
        closeUnusedDirectMessages,
        sidebarPreference,
        unreadsAtTop: sidebarPreference.unreads_at_top,
        favoriteAtTop: sidebarPreference.favorite_at_top,
        channelSwitcherOption,
        channelSidebarOrganizationOption: String(channelSidebarOrganizationOption),
        showChannelOrganization: config.ExperimentalChannelOrganization === 'true',
        showChannelSidebarOrganization: config.ExperimentalChannelSidebarOrganization !== 'disabled' && config.ExperimentalChannelSidebarOrganization !== 'always_on',
        showUnusedOption: config.CloseUnusedDirectMessages === 'true',
        user: getCurrentUser(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsSidebar);
