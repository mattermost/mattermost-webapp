// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCommands, getOAuthApps, getIncomingHooks, getOutgoingHooks} from 'mattermost-redux/selectors/entities/integrations';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBotAccounts} from 'mattermost-redux/selectors/entities/bots';

import {getSiteURL} from 'utils/url.jsx';

import ConfirmIntegration from './confirm_integration.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    // If we have a configured SiteURL, that is not a loopback, use it
    let siteURL = getSiteURL();
    if (config.SiteURL &&
        !config.SiteURL.match(/localhost|127(?:\.[0-9]+){0,2}\.[0-9]+|(?:0*:)*?:?0*1/g)) {
        siteURL = config.SiteURL;
    }

    return {
        commands: getCommands(state),
        oauthApps: getOAuthApps(state),
        incomingHooks: getIncomingHooks(state),
        outgoingHooks: getOutgoingHooks(state),
        bots: getBotAccounts(state),
        siteURL,
    };
}

export default connect(mapStateToProps)(ConfirmIntegration);
