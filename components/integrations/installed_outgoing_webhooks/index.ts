// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import * as Actions from 'mattermost-redux/actions/integrations';
import {getOutgoingHooks} from 'mattermost-redux/selectors/entities/integrations';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getUsers} from 'mattermost-redux/selectors/entities/users';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {loadOutgoingHooksAndProfilesForTeam} from 'actions/integration_actions';

import {GlobalState} from 'types/store';

import InstalledOutgoingWebhook, {Props} from './installed_outgoing_webhooks';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const teamId = getCurrentTeamId(state);
    const canManageOthersWebhooks = haveITeamPermission(state, teamId, Permissions.MANAGE_OTHERS_OUTGOING_WEBHOOKS);
    const outgoingHooks = getOutgoingHooks(state);
    const outgoingWebhooks = Object.keys(outgoingHooks).
        map((key) => outgoingHooks[key]).
        filter((outgoingWebhook) => outgoingWebhook.team_id === teamId);
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';

    return {
        outgoingWebhooks,
        channels: getAllChannels(state),
        users: getUsers(state),
        teamId,
        canManageOthersWebhooks,
        enableOutgoingWebhooks,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Props['actions']>({
            loadOutgoingHooksAndProfilesForTeam,
            removeOutgoingHook: Actions.removeOutgoingHook,
            regenOutgoingHookToken: Actions.regenOutgoingHookToken,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledOutgoingWebhook);
