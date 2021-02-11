// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {sendEmailInvitesToTeamGracefully, regenerateTeamInviteId} from 'mattermost-redux/actions/teams';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {ServerError} from 'mattermost-redux/types/errors';
import {TeamInviteWithError} from 'mattermost-redux/types/teams';
import {getSubscriptionStats} from 'mattermost-redux/actions/cloud';

import {GlobalState} from 'types/store';

import InviteMembersStep from './invite_members_step';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        team: getCurrentTeam(state),
        isEmailInvitesEnabled: config.EnableEmailInvitations === 'true',
        isCloud: getLicense(state).Cloud === 'true',
        cloudUserLimit: config.ExperimentalCloudUserLimit || 10,
        subscriptionStats: state.entities.cloud.subscriptionStats,
    };
}

type Actions = {
    sendEmailInvitesToTeamGracefully: (teamId: string, emails: string[]) => Promise<{ data: TeamInviteWithError[]; error: ServerError }>;
    regenerateTeamInviteId: (teamId: string) => void;
    getSubscriptionStats: () => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            sendEmailInvitesToTeamGracefully,
            regenerateTeamInviteId,
            getSubscriptionStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteMembersStep);
