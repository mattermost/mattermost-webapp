// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getProfilesInChannel} from 'mattermost-redux/actions/users';
import {getAllChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';

import PopoverListMembers from './popover_list_members.jsx';

const makeMapStateToProps = () => {
    const doGetProfilesInChannel = makeGetProfilesInChannel();

    return (state, ownProps) => {
        const stats = getAllChannelStats(state)[ownProps.channel.id] || {};
        const members = doGetProfilesInChannel(state, ownProps.channel.id, true);

        return {
            memberCount: stats.member_count,
            members,
            currentUserId: getCurrentUserId(state)
        };
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getProfilesInChannel
    }, dispatch)
});

export default connect(makeMapStateToProps, mapDispatchToProps)(PopoverListMembers);
