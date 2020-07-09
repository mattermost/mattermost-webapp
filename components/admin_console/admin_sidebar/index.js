// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPlugins} from 'mattermost-redux/actions/admin';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {haveINoPermissionOnSysConsoleItem, haveINoWritePermissionOnSysConsoleItem} from 'mattermost-redux/selectors/entities/roles';

import {getNavigationBlocked} from 'selectors/views/admin';
import {getAdminDefinition} from 'selectors/admin_console';

import AdminSidebar from './admin_sidebar.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);
    const buildEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const siteName = config.SiteName;
    const adminDefinition = getAdminDefinition(state);

    const readAccessMap = {};
    const writeAccessMap = {};
    Object.entries(adminDefinition).forEach(([key]) => {
        readAccessMap[key] = !haveINoPermissionOnSysConsoleItem(state, {resourceId: key});
        writeAccessMap[key] = !haveINoWritePermissionOnSysConsoleItem(state, {resourceId: key});
        if (key === 'user_management') {
            ['users', 'groups', 'teams', 'channels', 'permissions'].forEach((userManagementKey) => {
                const subKey = `${key}.${userManagementKey}`;
                writeAccessMap[subKey] = !haveINoWritePermissionOnSysConsoleItem(state, {resourceId: subKey});
            });
        }
    });

    return {
        license,
        config: state.entities.admin.config,
        plugins: state.entities.admin.plugins,
        navigationBlocked: getNavigationBlocked(state),
        buildEnterpriseReady,
        siteName,
        adminDefinition,
        readAccessMap,
        writeAccessMap,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPlugins,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {pure: false})(AdminSidebar);
