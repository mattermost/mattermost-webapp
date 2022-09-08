// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getTotalUsersStats as getTotalUsersStatsSelector} from 'mattermost-redux/selectors/entities/users';
import {getChannelIntroPluginComponents} from 'selectors/plugins';
import {GlobalState} from 'types/store';

import OffTopicIntroMessage from './off_topic';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const boardComponent = getChannelIntroPluginComponents(state).find((c) => c.pluginId === 'focalboard');
    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

    return {
        channel,
        stats,
        boardComponent,
    };
}

export default connect(mapStateToProps)(OffTopicIntroMessage);
