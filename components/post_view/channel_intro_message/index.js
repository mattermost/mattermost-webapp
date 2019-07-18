// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isCurrentChannelReadOnly, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInCurrentChannel, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants.jsx';
import {getCurrentLocale} from 'selectors/i18n';

import ChannelIntroMessage from './channel_intro_message.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enableUserCreation = config.EnableUserCreation === 'true';
    const isReadOnly = isCurrentChannelReadOnly(state);
    const team = getCurrentTeam(state);

    return {
        currentUserId: getCurrentUserId(state),
        channel: getCurrentChannel(state),
        locale: getCurrentLocale(state),
        channelProfiles: getProfilesInCurrentChannel(state),
        enableUserCreation,
        isReadOnly,
        fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
        teamIsGroupConstrained: Boolean(team.group_constrained),
    };
}

export default connect(mapStateToProps)(ChannelIntroMessage);
