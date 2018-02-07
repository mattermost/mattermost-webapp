// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'mattermost-redux/actions/integrations';
import {getOAuthApps} from 'mattermost-redux/selectors/entities/integrations';
import {haveISystemPerm} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import InstalledOAuthApps from './installed_oauth_apps.jsx';

function mapStateToProps(state) {
    return {
        canManageOauth: haveISystemPerm(state, {perm: Permissions.MANAGE_OAUTH}),
        oauthApps: getOAuthApps(state),
        regenOAuthAppSecretRequest: state.requests.integrations.updateOAuthApp
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getOAuthApps: Actions.getOAuthApps,
            regenOAuthAppSecret: Actions.regenOAuthAppSecret,
            deleteOAuthApp: Actions.deleteOAuthApp
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledOAuthApps);
