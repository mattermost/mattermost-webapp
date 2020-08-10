// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {sendEmailInvitesToTeamGracefully} from 'mattermost-redux/actions/teams';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {TeamInviteWithError} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';

import InviteMembersStep from './invite_members_step';

function mapStateToProps(state: GlobalState) {
    const team = getCurrentTeam(state);

    return {
        teamId: team.id,
    };
}

type Actions = {
    sendEmailInvitesToTeamGracefully: (teamId: string, emails: string[]) => Promise<{data: TeamInviteWithError[]}>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            sendEmailInvitesToTeamGracefully,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteMembersStep);
