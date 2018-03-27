// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {loadRolesIfNeeded, editRole} from 'mattermost-redux/actions/roles';

import {getRoles} from 'mattermost-redux/selectors/entities/roles';

import WebhookSettings from './custom_integrations_settings.jsx';

function mapStateToProps(state) {
    return {
        roles: getRoles(state),
        rolesRequest: state.requests.roles.getRolesByNames,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadRolesIfNeeded,
            editRole,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WebhookSettings);
