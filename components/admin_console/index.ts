// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {withRouter} from 'react-router-dom';

import {AdminConfig} from '@mattermost/types/config';
import {Role} from '@mattermost/types/roles';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {getConfig, getEnvironmentConfig, updateConfig} from 'mattermost-redux/actions/admin';
import {loadRolesIfNeeded, editRole} from 'mattermost-redux/actions/roles';
import * as Selectors from 'mattermost-redux/selectors/entities/admin';
import {getConfig as getGeneralConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';
import {selectChannel} from 'mattermost-redux/actions/channels';
import {selectTeam} from 'mattermost-redux/actions/teams';
import {isCurrentUserSystemAdmin, currentUserHasAnAdminRole, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {General} from 'mattermost-redux/constants';

import {setNavigationBlocked, deferNavigation, cancelNavigation, confirmNavigation} from 'actions/admin_actions.jsx';
import {showNavigationPrompt} from 'selectors/views/admin';
import {getAdminDefinition, getConsoleAccess} from 'selectors/admin_console';

import LocalStorageStore from 'stores/local_storage_store';

import {GlobalState} from 'types/store';

import AdminConsole from './admin_console';

function mapStateToProps(state: GlobalState) {
    const generalConfig = getGeneralConfig(state);
    const buildEnterpriseReady = generalConfig.BuildEnterpriseReady === 'true';
    const adminDefinition = getAdminDefinition(state);
    const teamId = LocalStorageStore.getPreviousTeamId(getCurrentUserId(state));
    const team = getTeam(state, teamId || '');
    const unauthorizedRoute = team ? `/${team.name}/channels/${General.DEFAULT_CHANNEL}` : '/';
    const consoleAccess = getConsoleAccess(state);

    return {
        config: Selectors.getConfig(state),
        environmentConfig: Selectors.getEnvironmentConfig(state),
        license: getLicense(state),
        buildEnterpriseReady,
        unauthorizedRoute,
        showNavigationPrompt: showNavigationPrompt(state),
        isCurrentUserSystemAdmin: isCurrentUserSystemAdmin(state),
        currentUserHasAnAdminRole: currentUserHasAnAdminRole(state),
        roles: getRoles(state),
        adminDefinition,
        consoleAccess,
        cloud: state.entities.cloud,
        team,
    };
}

type Actions = {
    getConfig: () => ActionFunc;
    getEnvironmentConfig: () => ActionFunc;
    setNavigationBlocked: () => void;
    confirmNavigation: () => void;
    cancelNavigation: () => void;
    loadRolesIfNeeded: (roles: Iterable<string>) => ActionFunc;
    selectChannel: (channelId: string) => void;
    selectTeam: (teamId: string) => void;
    editRole: (role: Role) => void;
    updateConfig?: (config: AdminConfig) => ActionFunc;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject, Actions>({
            getConfig,
            getEnvironmentConfig,
            updateConfig,
            setNavigationBlocked,
            deferNavigation,
            cancelNavigation,
            confirmNavigation,
            loadRolesIfNeeded,
            editRole,
            selectChannel,
            selectTeam,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(AdminConsole));
