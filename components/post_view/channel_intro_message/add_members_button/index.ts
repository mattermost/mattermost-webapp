// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getTotalUsersStats as getTotalUsersStatsSelector} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'types/store';

import AddMembersButton from './add_members_button';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

    return {
        channel,
        totalUsers: stats,
    };
}

export default connect(mapStateToProps)(AddMembersButton);
