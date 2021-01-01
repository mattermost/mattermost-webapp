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
        const addEntriesForKey = (entryKey) => {
            const permissions = ResourceToSysConsolePermissionsTable[entryKey].filter((x) => mySystemPermissions.has(x));
            consoleAccess.read[entryKey] = permissions.length !== 0;
            consoleAccess.write[entryKey] = permissions.some((permission) => permission.startsWith('sysconsole_write_'));
        };
        const mapAccessValuesForKey = ([key]) => {
            if (key === 'user_management') {
                ['users', 'groups', 'teams', 'channels', 'permissions', 'system_roles'].forEach((userManagementKey) => {
                    addEntriesForKey(`${key}.${userManagementKey}`);
                });
            } else {
                addEntriesForKey(key);
            }
        };
        Object.entries(adminDefinition).forEach(mapAccessValuesForKey);
        return consoleAccess;
    },
);
