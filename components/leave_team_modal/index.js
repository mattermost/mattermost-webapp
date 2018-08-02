// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {emitLeaveTeam, toggleSideBarRightMenuAction} from 'actions/global_actions.jsx';
import {ModalIdentifiers} from 'utils/constants';

import {getIsBusy} from '../../selectors/webrtc';

import LeaveTeamModal from './leave_team_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.LEAVE_TEAM;
    const currentUser = getCurrentUser(state);
    const isBusy = getIsBusy(state);
    const show = state.views.modals.modalState[modalId] && state.views.modals.modalState[modalId].open;
    return {
        currentUser,
        show,
        isBusy,
        actions: {
            removeUserFromTeam: emitLeaveTeam,
            toggleSideBarRightMenu: toggleSideBarRightMenuAction,
        },
    };
}

export default connect(mapStateToProps)(LeaveTeamModal);
