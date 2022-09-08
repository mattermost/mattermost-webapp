// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getTotalUsersStats as getTotalUsersStatsSelector} from 'mattermost-redux/selectors/entities/users';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getTotalUsersStats} from 'mattermost-redux/actions/users';
import {Preferences} from 'utils/constants';
import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import ChannelIntroMessage from './channel_intro_message';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};
    const usersLimit = 10;

    return {
        channel,
        fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
        stats,
        usersLimit,
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
