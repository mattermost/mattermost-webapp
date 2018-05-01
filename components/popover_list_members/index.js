// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getProfilesInChannel} from 'mattermost-redux/actions/users';
import {getAllChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, getUserStatuses, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';

import PopoverListMembers from './popover_list_members.jsx';

function makeMapStateToProps() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();

    return function mapStateToProps(state, ownProps) {
        const stats = getAllChannelStats(state)[ownProps.channel.id] || {};
        const users = doGetProfilesInChannel(state, ownProps.channel.id, true);

        return {
            currentUserId: getCurrentUserId(state),
            memberCount: stats.member_count,
            users,
            statuses: getUserStatuses(state),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfilesInChannel,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PopoverListMembers);
