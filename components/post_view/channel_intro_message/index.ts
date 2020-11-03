// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isCurrentChannelReadOnly, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInCurrentChannel, getCurrentUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {UserProfile} from 'mattermost-redux/types/users';

import {Preferences} from 'utils/constants';
import {getDirectTeammate, getDisplayNameByUser} from 'utils/utils.jsx';
import {getCurrentLocale} from 'selectors/i18n';

import {GlobalState} from 'types/store';

import ChannelIntroMessage from './channel_intro_message';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const enableUserCreation = config.EnableUserCreation === 'true';
    const isReadOnly = isCurrentChannelReadOnly(state);
    const team = getCurrentTeam(state);
    const channel = getCurrentChannel(state);
    const teammate = getDirectTeammate(state, channel.id) as UserProfile;
    const creator = getUser(state, channel.creator_id);

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
    };
}

export default connect(mapStateToProps)(ChannelIntroMessage);
