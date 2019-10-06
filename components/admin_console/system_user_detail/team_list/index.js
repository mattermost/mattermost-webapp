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

import {getCurrentLocale} from 'selectors/i18n';

import TeamList from './team_list.jsx';

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
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamList);