// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getProfilesNotInTeam, searchProfiles} from 'mattermost-redux/actions/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {searchProfilesNotInCurrentTeam, getProfilesNotInCurrentTeam} from 'mattermost-redux/selectors/entities/users';

import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {addUsersToTeam} from 'actions/team_actions.jsx';
import {setModalSearchTerm} from 'actions/views/search';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import AddUsersToTeam from './add_users_to_team.jsx';

function mapStateToProps(state) {
    const searchTerm = state.views.search.modalSearch;

    let users;
    if (searchTerm) {
        users = searchProfilesNotInCurrentTeam(state, searchTerm, true);
    } else {
        users = getProfilesNotInCurrentTeam(state);
    }

    const team = getCurrentTeam(state) || {};
    const modalId = ModalIdentifiers.ADD_USER_TO_TEAM;

    return {
        currentTeamName: team.display_name,
        currentTeamId: team.id,
        currentTeamGroupConstrained: team.group_constrained,
        searchTerm,
        users,
        show: isModalOpen(state, modalId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfilesNotInTeam,
            setModalSearchTerm,
            searchProfiles,
            addUsersToTeam,
            loadStatusesForProfilesList,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddUsersToTeam);
