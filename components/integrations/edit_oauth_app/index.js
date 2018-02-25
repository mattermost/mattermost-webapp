// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getOAuthApp, editOAuthApp} from 'mattermost-redux/actions/integrations';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import EditOAuthApp from './edit_oauth_app.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const oauthAppId = (new URLSearchParams(ownProps.location.search)).get('id');
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';

    return {
        isSystemAdmin: isCurrentUserSystemAdmin(state),
        oauthAppId,
        oauthApp: state.entities.integrations.oauthApps[oauthAppId],
        enableOAuthServiceProvider,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getOAuthApp,
            editOAuthApp,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditOAuthApp);
