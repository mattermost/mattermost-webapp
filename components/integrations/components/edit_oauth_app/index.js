// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getOAuthApp, editOAuthApp} from 'mattermost-redux/actions/integrations';

import EditOAuthApp from './edit_oauth_app.jsx';

function mapStateToProps(state, ownProps) {
    const oauthAppId = ownProps.location.query.id;

    return {
        ...ownProps,
        oauthAppId,
        oauthApp: state.entities.integrations.oauthApps[oauthAppId],
        editOAuthAppRequest: state.requests.integrations.updateOAuthApp
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getOAuthApp,
            editOAuthApp
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditOAuthApp);
