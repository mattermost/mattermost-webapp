// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'mattermost-redux/actions/integrations';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getIncomingHooks} from 'mattermost-redux/selectors/entities/integrations';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getUsers} from 'mattermost-redux/selectors/entities/users';
import {haveITeamPerm} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import InstalledIncomingWebhooks from './installed_incoming_webhooks.jsx';

function mapStateToProps(state, ownProps) {
    const teamId = getCurrentTeamId(state);
    const canManageOthersWebhooks = haveITeamPerm(state, {team: teamId, perm: Permissions.MANAGE_OTHERS_WEBHOOKS});
    const incomingHooks = getIncomingHooks(state);
    const incomingWebhooks = Object.keys(incomingHooks).
        map((key) => incomingHooks[key]).
        filter((incomingWebhook) => incomingWebhook.team_id === teamId);

    return {
        ...ownProps,
        incomingWebhooks,
        channels: getAllChannels(state),
        users: getUsers(state),
        teamId,
        canManageOthersWebhooks
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getIncomingHooks: Actions.getIncomingHooks,
            removeIncomingHook: Actions.removeIncomingHook
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledIncomingWebhooks);
