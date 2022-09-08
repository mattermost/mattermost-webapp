// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getTotalUsersStats as getTotalUsersStatsSelector} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';

import OffTopicIntroMessage from './off_topic';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

    return {
        channel,
        stats,
    };
}

export default connect(mapStateToProps)(OffTopicIntroMessage);
