// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {removeUserFromTeam as leaveTeam} from 'mattermost-redux/actions/teams';
import {GenericAction} from 'mattermost-redux/types/actions';

import {toggleSideBarRightMenuAction} from 'actions/global_actions.jsx';
import {ModalIdentifiers} from 'utils/constants';

import {isModalOpen} from 'selectors/views/modals';

import {GlobalState} from 'types/store';

import LeaveTeamModal from './leave_team_modal';

function mapStateToProps(state: GlobalState) {
    const modalId = ModalIdentifiers.LEAVE_TEAM;
    const currentUserId = getCurrentUserId(state);
    const currentTeamId = getCurrentTeamId(state);
    const show = isModalOpen(state, modalId);
    return {
        currentUserId,
        currentTeamId,
        show,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            leaveTeam,
            toggleSideBarRightMenu: toggleSideBarRightMenuAction,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaveTeamModal);
