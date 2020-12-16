// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {removeIncomingHook} from 'mattermost-redux/actions/integrations';

import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getIncomingHooks} from 'mattermost-redux/selectors/entities/integrations';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getUsers, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {IncomingWebhook} from 'mattermost-redux/types/integrations';

import {loadIncomingHooksAndProfilesForTeam} from 'actions/integration_actions.jsx';

import InstalledIncomingWebhooks from './installed_incoming_webhooks';

type Actions = {
    removeIncomingHook: (hookId: string) => Promise<ActionResult>;
    loadIncomingHooksAndProfilesForTeam: (teamId: string, startPageNumber: number, pageSize: string) => Promise<ActionResult>;
}

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const team = getCurrentTeam(state);
    const user = getCurrentUser(state);
    const canManageOthersWebhooks: boolean = haveITeamPermission(state, {team: team.id, permission: Permissions.MANAGE_OTHERS_INCOMING_WEBHOOKS});
    const incomingHooks = getIncomingHooks(state);
    const incomingWebhooks: IncomingWebhook[] = Object.keys(incomingHooks).
        map((key) => incomingHooks[key]).
        filter((incomingWebhook) => incomingWebhook.team_id === team.id);
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';

    return {
        team,
        user,
        incomingWebhooks,
        channels: getAllChannels(state),
        users: getUsers(state),
        canManageOthersWebhooks,
        enableIncomingWebhooks,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            loadIncomingHooksAndProfilesForTeam,
            removeIncomingHook,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledIncomingWebhooks);
