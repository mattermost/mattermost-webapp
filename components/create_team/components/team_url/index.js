// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {checkIfTeamExists, createTeam} from 'mattermost-redux/actions/teams';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import TeamUrl from './team_url';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state);

    return {
        currentUserId: currentUser.id,
        currentUserRoles: currentUser.roles || '',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            checkIfTeamExists,
            createTeam,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamUrl);
