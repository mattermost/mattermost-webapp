// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'mattermost-redux/actions/integrations';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getIncomingHooks} from 'mattermost-redux/selectors/entities/integrations';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getUsers} from 'mattermost-redux/selectors/entities/users';

import InstalledIncomingWebhooks from './installed_incoming_webhooks.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const teamId = getCurrentTeamId(state);
    const incomingHooks = getIncomingHooks(state);
    const incomingWebhooks = Object.keys(incomingHooks).
        map((key) => incomingHooks[key]).
        filter((incomingWebhook) => incomingWebhook.team_id === teamId);
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';

    return {
        ...ownProps,
        incomingWebhooks,
        channels: getAllChannels(state),
        users: getUsers(state),
        teamId,
        enableIncomingWebhooks
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
