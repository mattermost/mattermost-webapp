// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import Integrations from './integrations.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const siteName = config.SiteName;
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enableCommands = config.EnableCommands === 'true';
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';
    const enableOnlyAdminIntegrations = config.EnableOnlyAdminIntegrations === 'true';

    return {
        ...ownProps,
        siteName,
        enableIncomingWebhooks,
        enableOutgoingWebhooks,
        enableCommands,
        enableOAuthServiceProvider,
        enableOnlyAdminIntegrations
    };
}

export default connect(mapStateToProps)(Integrations);
