// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {haveISystemPerm} from 'mattermost-redux/selectors/entities/roles';

import SystemPermissionGate from './system_permission_gate.jsx';

function mapStateToProps(state, ownProps) {
    for (const perm of ownProps.perms) {
        if (haveISystemPerm(state, {perm})) {
            return {hasPerm: true};
        }
    }

    return {hasPerm: false};
}

export default connect(mapStateToProps)(SystemPermissionGate);
