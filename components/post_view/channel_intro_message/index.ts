// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isCurrentChannelReadOnly, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInCurrentChannel, getCurrentUserId, getUser, getTotalUsersStats as getTotalUsersStatsSelector} from 'mattermost-redux/selectors/entities/users';
import {get, getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getTotalUsersStats} from 'mattermost-redux/actions/users';

import {UserProfile} from 'mattermost-redux/types/users';

import {Preferences} from 'utils/constants';
import {getDirectTeammate, getDisplayNameByUser} from 'utils/utils.jsx';
import {getCurrentLocale} from 'selectors/i18n';

import {GlobalState} from 'types/store';

import {GenericAction} from 'mattermost-redux/types/actions';

import ChannelIntroMessage from './channel_intro_message';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const enableUserCreation = config.EnableUserCreation === 'true';
    const isReadOnly = isCurrentChannelReadOnly(state);
    const team = getCurrentTeam(state);
    const channel = getCurrentChannel(state) || {};
    const teammate = getDirectTeammate(state, channel.id) as UserProfile;
    const creator = getUser(state, channel.creator_id);

    let usersLimit = parseInt(getConfig(state).ExperimentalCloudUserLimit! || '10', 10);
    if (usersLimit === 0) {
        usersLimit = 10;
    }

    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

    return {
        currentUserId: getCurrentUserId(state),
        channel,
        fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
        locale: getCurrentLocale(state),
        channelProfiles: getProfilesInCurrentChannel(state),
        enableUserCreation,
        isReadOnly,
        teamIsGroupConstrained: Boolean(team.group_constrained),
        creatorName: getDisplayNameByUser(state, creator),
        teammate,
        teammateName: getDisplayNameByUser(state, teammate),
        stats,
        usersLimit,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getTotalUsersStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelIntroMessage);
