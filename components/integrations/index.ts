// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import Integrations from './integrations';
import { GlobalState } from 'types/store/index.js';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const siteName = config.SiteName;
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enableCommands = config.EnableCommands === 'true';
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';
    const integrationTypes = state.plugins.components.IntegrationType;

    return {
        siteName,
        enableIncomingWebhooks,
        enableOutgoingWebhooks,
        enableCommands,
        enableOAuthServiceProvider,
        integrationTypes,
    };
}

export default connect(mapStateToProps)(Integrations);
