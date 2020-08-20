// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import {isAdmin} from 'utils/utils.jsx';

import InvitationModalMembersStep from './invitation_modal_members_step';

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        currentUsers: state.entities.admin.analytics!.TOTAL_USERS,
        userIsAdmin: isAdmin(getMyTeamMember(state, ownProps.currentTeamId).roles),
    };
}

export default connect(mapStateToProps)(InvitationModalMembersStep);
