// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateTeamMemberSchemeRoles, getTeamMembersForUser, getTeamsForUser} from 'mattermost-redux/actions/teams';

import {removeUserFromTeam} from 'actions/team_actions.jsx';
import {getCurrentLocale} from 'selectors/i18n';

import ManageTeamsModal from './manage_teams_modal';

function mapStateToProps(state) {
    return {
        locale: getCurrentLocale(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeamMembersForUser,
            getTeamsForUser,
            updateTeamMemberSchemeRoles,
            removeUserFromTeam,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageTeamsModal);
