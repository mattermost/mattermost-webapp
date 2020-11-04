// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {uniq, difference} from 'lodash';

import {Role} from 'mattermost-redux/types/roles';

import {UserProfile} from 'mattermost-redux/types/users';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {ActionResult} from 'mattermost-redux/types/actions';

import Permissions from 'mattermost-redux/constants/permissions';

import Constants from 'utils/constants';
import {browserHistory} from 'utils/browser_history';

import FormError from 'components/form_error';
import BlockableLink from 'components/admin_console/blockable_link';
import SaveChangesPanel from 'components/admin_console/team_channel_settings/save_changes_panel';

import {isError} from 'types/actions';

import SystemRoleUsers from './system_role_users';
import SystemRolePermissions from './system_role_permissions';
import {PermissionToUpdate, PermissionsToUpdate, writeAccess} from './types';

type Props = {
    role: Role;
    isDisabled?: boolean;

    actions: {
        editRole(role: Role): Promise<ActionResult>;
        updateUserRoles(userId: string, roles: string): Promise<ActionResult>;
        setNavigationBlocked: (blocked: boolean) => void;
    }
}

type State = {
    usersToAdd: Dictionary<UserProfile>;
    usersToRemove: Dictionary<UserProfile>;
    permissionsToUpdate: PermissionsToUpdate;
    updatedRolePermissions: string[];
    saving: boolean;
    saveNeeded: boolean;
    serverError: JSX.Element | null;
    saveKey: number;
}

export default class SystemRole extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            usersToAdd: {},
            usersToRemove: {},
            saving: false,
            saveNeeded: false,
            serverError: null,
            permissionsToUpdate: {},
            saveKey: 0,
            updatedRolePermissions: [],
        };
    }

    getSaveStateNeeded = (nextState: Partial<State>): boolean => {
        const {role} = this.props;
        const {usersToAdd, usersToRemove, updatedRolePermissions, permissionsToUpdate} = {...this.state, ...nextState};
        let saveNeeded = false;
        saveNeeded = Object.keys(usersToAdd).length > 0 || Object.keys(usersToRemove).length > 0;
        if (Object.keys(permissionsToUpdate).length > 0) {
            saveNeeded = saveNeeded || difference(updatedRolePermissions, role.permissions).length > 0 || difference(role.permissions, updatedRolePermissions).length > 0;
        }
        return saveNeeded;
    }

    addUsersToRole = (users: UserProfile[]) => {
        const usersToAdd = {
            ...this.state.usersToAdd,
        };
        const usersToRemove = {
            ...this.state.usersToRemove,
        };
        users.forEach((user) => {
            if (usersToRemove[user.id]) {
                delete usersToRemove[user.id];
            } else {
                usersToAdd[user.id] = user;
            }
        });

        this.setState({usersToAdd, usersToRemove, saveNeeded: this.getSaveStateNeeded({usersToAdd, usersToRemove})});
    }

    removeUserFromRole = (user: UserProfile) => {
        const usersToAdd = {
            ...this.state.usersToAdd,
        };
        const usersToRemove = {
            ...this.state.usersToRemove,
        };
        if (usersToAdd[user.id]) {
            delete usersToAdd[user.id];
        } else {
            usersToRemove[user.id] = user;
        }
        this.setState({usersToRemove, usersToAdd, saveNeeded: this.getSaveStateNeeded({usersToAdd, usersToRemove})});
    }

    handleSubmit = async () => {
        this.setState({saving: true, saveNeeded: false});
        const {usersToRemove, usersToAdd, updatedRolePermissions, permissionsToUpdate} = this.state;
        const {role, actions: {editRole, updateUserRoles, setNavigationBlocked}} = this.props;
        let serverError = null;

        // Do not update permissions if sysadmin or if roles have not been updated (to prevent overrwiting roles with no permissions)
        if (role.name !== Constants.PERMISSIONS_SYSTEM_ADMIN && Object.keys(permissionsToUpdate).length > 0) {
            const newRole: Role = {
                ...role,
                permissions: updatedRolePermissions,
            };
            const result = await editRole(newRole);
            if (isError(result)) {
                serverError = <FormError error={result.error.message}/>;
            }
        }

        const userIdsToRemove = Object.keys(usersToRemove);
        if (userIdsToRemove.length > 0) {
            const removeUserPromises: Promise<ActionResult>[] = [];
            userIdsToRemove.forEach((userId) => {
                const user = usersToRemove[userId];
                const updatedRoles = uniq(user.roles.split(' ').filter((r) => r !== role.name)).join(' ');
                removeUserPromises.push(updateUserRoles(userId, updatedRoles));
            });

            const results = await Promise.all(removeUserPromises);
            const resultWithError = results.find(isError);

            // const count = result.filter(isSuccess).length; // To be used for potential telemetry
            if (resultWithError && 'error' in resultWithError) {
                serverError = <FormError error={resultWithError.error.message}/>;
            }
        }

        const userIdsToAdd = Object.keys(usersToAdd);
        if (userIdsToAdd.length > 0 && serverError == null) {
            const addUserPromises: Promise<ActionResult>[] = [];
            userIdsToAdd.forEach((userId) => {
                const user = usersToAdd[userId];
                const updatedRoles = uniq([...user.roles.split(' '), role.name]).join(' ');
                addUserPromises.push(updateUserRoles(userId, updatedRoles));
            });

            const results = await Promise.all(addUserPromises);
            const resultWithError = results.find(isError);

            // const count = result.filter(isSuccess).length; // To be used for potential telemetry
            if (resultWithError && 'error' in resultWithError) {
                serverError = <FormError error={resultWithError.error.message}/>;
            }
        }

        let {saveKey} = this.state;
        if (serverError === null) {
            saveKey += 1;
        }

        if (serverError === null) {
            browserHistory.push('/admin_console/user_management/system_roles');
        }
        setNavigationBlocked(serverError !== null);
        this.setState({
            saveNeeded: (serverError !== null),
            saving: false,
            serverError,
            usersToAdd: {},
            usersToRemove: {},
            saveKey,
        });
    }

    updatePermissions = (permissions: PermissionToUpdate[]) => {
        const {role, actions: {setNavigationBlocked}} = this.props;
        const updatedPermissions: PermissionsToUpdate = {};
        permissions.forEach((perm) => {
            updatedPermissions[perm.name] = perm.value;
        });
        const permissionsToUpdate = {
            ...this.state.permissionsToUpdate,
            ...updatedPermissions,
        };

        let updatedRolePermissions: string[] = [];

        // Determine required ancillary permissions...
        role.permissions.forEach((permission) => {
            if (permission.startsWith('sysconsole_')) {
                const permissionShortName = permission.replace(/sysconsole_(read|write)_/, '');
                if (!(permissionShortName in permissionsToUpdate)) {
                    const ancillary = Permissions.SYSCONSOLE_ANCILLARY_PERMISSIONS[permission] || [];
                    updatedRolePermissions.push(...ancillary, permission);
                }
            }
        });

        Object.keys(permissionsToUpdate).forEach((permissionShortName) => {
            const value = permissionsToUpdate[permissionShortName];
            if (value) {
                const readPermission = `sysconsole_read_${permissionShortName}`;
                const writePermission = `sysconsole_write_${permissionShortName}`;
                const readAncillary = Permissions.SYSCONSOLE_ANCILLARY_PERMISSIONS[readPermission] || [];
                const writeAncillary = Permissions.SYSCONSOLE_ANCILLARY_PERMISSIONS[writePermission] || [];

                if (value === writeAccess) {
                    updatedRolePermissions.push(...readAncillary, ...writeAncillary, readPermission, writePermission);
                } else {
                    updatedRolePermissions.push(...readAncillary, readPermission);
                }
            }
        });

        // Make sure the sysadmin role always has manage system...
        if (role.name === Constants.PERMISSIONS_SYSTEM_ADMIN) {
            updatedRolePermissions.push(Permissions.MANAGE_SYSTEM);
        }

        updatedRolePermissions = uniq(updatedRolePermissions);
        const nextState = {
            permissionsToUpdate,
            updatedRolePermissions,
        };

        setNavigationBlocked(this.getSaveStateNeeded(nextState));
        this.setState({
            ...nextState,
            saveNeeded: this.getSaveStateNeeded(nextState),
        });
    }

    render() {
        const {usersToAdd, usersToRemove, saving, saveNeeded, serverError, permissionsToUpdate, saveKey} = this.state;
        const {role, isDisabled} = this.props;
        const defaultName = role.name.split('').map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(' ');
        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/system_roles'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id={`admin.permissions.roles.${role.name}.name`}
                            defaultMessage={defaultName}
                        />
                    </div>
                </div>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <SystemRolePermissions
                            role={role}
                            permissionsToUpdate={permissionsToUpdate}
                            updatePermissions={this.updatePermissions}
                            readOnly={isDisabled || role.name === Constants.PERMISSIONS_SYSTEM_ADMIN}
                        />

                        <SystemRoleUsers
                            key={saveKey}
                            roleName={role.name}
                            usersToAdd={usersToAdd}
                            usersToRemove={usersToRemove}
                            onAddCallback={this.addUsersToRole}
                            onRemoveCallback={this.removeUserFromRole}
                            readOnly={isDisabled}
                        />
                    </div>
                </div>

                <SaveChangesPanel
                    saving={saving}
                    cancelLink='/admin_console/user_management/system_roles'
                    saveNeeded={saveNeeded}
                    onClick={this.handleSubmit}
                    serverError={serverError}
                    isDisabled={isDisabled}
                />
            </div>
        );
    }
}

