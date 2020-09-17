// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';

import {GlobalState} from 'types/store';

import SystemRoles from './system_roles';

function mapStateToProps(state: GlobalState) {
    const roles = (({system_admin, system_user_manager, system_manager, system_read_only_admin}) => ({system_admin, system_user_manager, system_manager, system_read_only_admin}))(getRoles(state)); // eslint-disable-line @typescript-eslint/naming-convention

    return {
        roles,
    };
}

export default connect(mapStateToProps)(SystemRoles);
