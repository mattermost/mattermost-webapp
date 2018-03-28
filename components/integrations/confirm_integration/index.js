// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCommands, getOAuthApps, getOutgoingHooks} from 'mattermost-redux/selectors/entities/integrations';

import ConfirmIntegration from './confirm_integration.jsx';

function mapStateToProps(state) {
    return {
        commands: getCommands(state),
        oauthApps: getOAuthApps(state),
        outgoingHooks: getOutgoingHooks(state),
    };
}

export default connect(mapStateToProps)(ConfirmIntegration);
