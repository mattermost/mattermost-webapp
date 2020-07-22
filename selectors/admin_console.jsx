// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {cloneDeep} from 'lodash';

import {getMySystemPermissions} from 'mattermost-redux/selectors/entities/roles_helpers';
import {ResourceToSysConsolePermissionsTable} from 'mattermost-redux/constants/permissions_sysconsole';

import AdminDefinition from 'components/admin_console/admin_definition.jsx';

export const getAdminDefinition = createSelector(
    () => AdminDefinition,
    (state) => state.plugins.adminConsoleReducers,
    (adminDefinition, reducers) => {
        let result = cloneDeep(AdminDefinition);
        for (const reducer of Object.values(reducers)) {
            result = reducer(result);
        }
        return result;
    },
);

export const getAdminConsoleCustomComponents = (state, pluginId) =>
    state.plugins.adminConsoleCustomComponents[pluginId] || {};

export const getConsoleAccess = createSelector(
    getAdminDefinition,
    getMySystemPermissions,
    (adminDefinition, mySystemPermissions) => {
        const consoleAccess = {read: {}, write: {}};

        const mapAccessValuesForKey = ([key]) => {
            const permissionsForKey = ResourceToSysConsolePermissionsTable[key].filter((x) => mySystemPermissions.has(x));

            consoleAccess.read[key] = permissionsForKey.length !== 0;
            consoleAccess.write[key] = !consoleAccess.read[key] || !permissionsForKey.some((permission) => permission.startsWith('write'));

            if (key === 'user_management') {
                ['users', 'groups', 'teams', 'channels', 'permissions'].forEach((userManagementKey) => {
                    const subKey = `${key}.${userManagementKey}`;

                    const permissionsForSubkey = ResourceToSysConsolePermissionsTable[subKey].filter((x) => mySystemPermissions.has(x));

                    consoleAccess.read[subKey] = permissionsForSubkey.length !== 0;
                    consoleAccess.write[subKey] = !consoleAccess.read[key] || !permissionsForSubkey.some((permission) => permission.startsWith('write'));
                });
            }
        };

        Object.entries(adminDefinition).forEach(mapAccessValuesForKey);

        return consoleAccess;
    },
);