// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {toggleSideBarRightMenuAction} from 'actions/global_actions.jsx';
import {removeUserFromTeam} from 'actions/team_actions';
import {ModalIdentifiers} from 'utils/constants';

import {isModalOpen} from 'selectors/views/modals';

import LeaveTeamModal from './leave_team_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.LEAVE_TEAM;
    const currentUserId = getCurrentUserId(state);
    const currentTeamId = getCurrentTeamId(state);
    const show = isModalOpen(state, modalId);
    return {
        currentUserId,
        currentTeamId,
        show,
        actions: {
            removeUserFromTeam,
            toggleSideBarRightMenu: toggleSideBarRightMenuAction,
        },
    };
}

export default connect(mapStateToProps)(LeaveTeamModal);
