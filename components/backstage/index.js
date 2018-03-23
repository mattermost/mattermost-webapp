// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam, getCurrentTeamMembership} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {isSystemAdmin, isAdmin as isTeamAdmin} from 'utils/utils.jsx';

import BackstageController from './backstage_controller.jsx';

function mapStateToProps(state) {
    const user = getCurrentUser(state);
    const team = getCurrentTeam(state);
    const teamMember = getCurrentTeamMembership(state);

    let isAdmin = false;
    if (user) {
        isAdmin = isSystemAdmin(user.roles);
    }

    if (teamMember) {
        isAdmin = isAdmin || isTeamAdmin(teamMember.roles);
    }

    const config = getConfig(state);

    const siteName = config.SiteName;
    const enableCustomEmoji = config.EnableCustomEmoji === 'true';
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enableCommands = config.EnableCommands === 'true';
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';
    const enableOnlyAdminIntegrations = config.EnableOnlyAdminIntegrations === 'true';

    return {
        user,
        team,
        isAdmin,
        siteName,
        enableCustomEmoji,
        enableIncomingWebhooks,
        enableOutgoingWebhooks,
        enableCommands,
        enableOAuthServiceProvider,
        enableOnlyAdminIntegrations,
    };
}

export default withRouter(connect(mapStateToProps)(BackstageController));
