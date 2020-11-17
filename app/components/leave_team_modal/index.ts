// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getCurrentUserId, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getPrivateChannels, getPublicChannels} from 'mattermost-redux/selectors/entities/channels';
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
    const privateChannels = getPrivateChannels(state);
    const publicChannels = getPublicChannels(state);
    const show = isModalOpen(state, modalId);
    const currentUser = getCurrentUser(state);
    return {
        currentUserId,
        currentTeamId,
        show,
        currentUser,
        privateChannels,
        publicChannels,
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
