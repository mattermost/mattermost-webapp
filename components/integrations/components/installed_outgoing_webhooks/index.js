import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'mattermost-redux/actions/integrations';
import {getOutgoingHooks} from 'mattermost-redux/selectors/entities/integrations';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getUsers} from 'mattermost-redux/selectors/entities/users';
import {haveITeamPerm} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import InstalledOutgoingWebhook from './installed_outgoing_webhooks.jsx';

function mapStateToProps(state) {
    const teamId = getCurrentTeamId(state);
    const canManageOthersWebhooks = haveITeamPerm(state, {team: teamId, perm: Permissions.MANAGE_OTHERS_WEBHOOKS});
    const outgoingHooks = getOutgoingHooks(state);
    const outgoingWebhooks = Object.keys(outgoingHooks).
        map((key) => outgoingHooks[key]).
        filter((outgoingWebhook) => outgoingWebhook.team_id === teamId);

    return {
        outgoingWebhooks,
        channels: getAllChannels(state),
        users: getUsers(state),
        teamId,
        canManageOthersWebhooks
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getOutgoingHooks: Actions.getOutgoingHooks,
            removeOutgoingHook: Actions.removeOutgoingHook,
            regenOutgoingHookToken: Actions.regenOutgoingHookToken
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledOutgoingWebhook);
