import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'mattermost-redux/actions/integrations';
import {getOutgoingHooks} from 'mattermost-redux/selectors/entities/integrations';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getUsers} from 'mattermost-redux/selectors/entities/users';

import InstalledOutgoingWebhook from './installed_outgoing_webhooks.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        outgoingWebhooks: getOutgoingHooks(state),
        channels: getAllChannels(state),
        users: getUsers(state),
        teamId: getCurrentTeamId(state)
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
