// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getConfig, getEnvironmentConfig, updateConfig} from 'mattermost-redux/actions/admin';
import {loadRolesIfNeeded, editRole} from 'mattermost-redux/actions/roles';
import * as Selectors from 'mattermost-redux/selectors/entities/admin';
import {withRouter} from 'react-router-dom';
import {getConfig as getGeneralConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';
import {isCurrentUserSystemAdmin, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {General} from 'mattermost-redux/constants';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import {setNavigationBlocked, deferNavigation, cancelNavigation, confirmNavigation} from 'actions/admin_actions.jsx';
import {getNavigationBlocked, showNavigationPrompt} from 'selectors/views/admin';
import {getAdminDefinition} from 'selectors/admin_console';

import LocalStorageStore from 'stores/local_storage_store';

import AdminConsole from './admin_console';

function mapStateToProps(state: GlobalState) {
    const generalConfig = getGeneralConfig(state);
    const buildEnterpriseReady = generalConfig.BuildEnterpriseReady === 'true';
    const adminDefinition = getAdminDefinition(state);
    const teamId = LocalStorageStore.getPreviousTeamId(getCurrentUserId(state));
    const team = getTeam(state, teamId || '');
    const unauthorizedRoute = team ? `/${team.name}/channels/${General.DEFAULT_CHANNEL}` : '/';

    return {
        config: Selectors.getConfig(state),
        environmentConfig: Selectors.getEnvironmentConfig(state),
        license: getLicense(state),
        buildEnterpriseReady,
        unauthorizedRoute,
        navigationBlocked: getNavigationBlocked(state),
        showNavigationPrompt: showNavigationPrompt(state),
        isCurrentUserSystemAdmin: isCurrentUserSystemAdmin(state),
        roles: getRoles(state),
        adminDefinition,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getConfig,
            getEnvironmentConfig,
            updateConfig,
            setNavigationBlocked,
            deferNavigation,
            cancelNavigation,
            confirmNavigation,
            loadRolesIfNeeded,
            editRole,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdminConsole));
