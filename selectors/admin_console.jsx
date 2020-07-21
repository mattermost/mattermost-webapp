// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {cloneDeep} from 'lodash';

import {haveINoPermissionOnSysConsoleItem, haveINoWritePermissionOnSysConsoleItem} from 'mattermost-redux/selectors/entities/roles';

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
    (state) => state,
    getAdminDefinition,
    (state, adminDefinition) => {
        const consoleAccess = {read: {}, write: {}};

        const mapAccessValuesForKey = ([key]) => {
            consoleAccess.read[key] = !haveINoPermissionOnSysConsoleItem(state, {resourceId: key});
            consoleAccess.write[key] = !haveINoWritePermissionOnSysConsoleItem(state, {resourceId: key});
            if (key === 'user_management') {
                ['users', 'groups', 'teams', 'channels', 'permissions'].forEach((userManagementKey) => {
                    const subKey = `${key}.${userManagementKey}`;
                    consoleAccess.read[subKey] = !haveINoPermissionOnSysConsoleItem(state, {resourceId: subKey});
                    consoleAccess.write[subKey] = !haveINoWritePermissionOnSysConsoleItem(state, {resourceId: subKey});
                });
            }
        };

        Object.entries(adminDefinition).forEach(mapAccessValuesForKey);

        return consoleAccess;
    },
);