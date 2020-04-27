// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import Permissions from 'mattermost-redux/constants/permissions';

import PermissionsTree from './permissions_tree.jsx';

export const EXCLUDED_PERMISSIONS = [
    Permissions.VIEW_MEMBERS,
    Permissions.JOIN_PUBLIC_TEAMS,
    Permissions.LIST_PUBLIC_TEAMS,
    Permissions.JOIN_PRIVATE_TEAMS,
    Permissions.LIST_PRIVATE_TEAMS,
];

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        config,
    };
}

export default connect(mapStateToProps)(PermissionsTree);
