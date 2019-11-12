// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    getTeamsForUser,
    getTeamMembersForUser,
    removeUserFromTeam,
    updateTeamMemberSchemeRoles,
} from 'mattermost-redux/actions/teams';

import {
    getMyChannelMember,
    getMyChannelMembers,
    getChannelsForUser,
} from 'mattermost-redux/actions/channels';

import {getCurrentLocale} from 'selectors/i18n';

import ChannelList from './channel_list.jsx';

function mapStateToProps(state) {
    return {
        locale: getCurrentLocale(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeamsData: getTeamsForUser,
            getTeamMembersForUser,
            removeUserFromTeam,
            updateTeamMemberSchemeRoles,
            getMyChannelMember,
            getMyChannelMembers,
            getChannelsForUser,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelList);