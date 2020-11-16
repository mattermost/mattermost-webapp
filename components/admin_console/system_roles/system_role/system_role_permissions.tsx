// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {Role} from 'mattermost-redux/types/roles';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import Constants from 'utils/constants';

import SystemRolePermission from './system_role_permission';
import {PermissionsToUpdate, PermissionToUpdate, SystemSection} from './types';

import './system_role_permissions.scss';

type Props = {
    role: Role;
    permissionsToUpdate: PermissionsToUpdate;
    updatePermissions: (permissions: PermissionToUpdate[]) => void;
    readOnly?: boolean;
}

type State = {
    visibleSections: Record<string, boolean>;
}

// the actual permissions correlating to these values are of the format `sysconsole_(read|write)_name(.subsection.name)`
const sectionsList: SystemSection[] = [
    {
        name: 'about',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'reporting',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'user_management',
        hasDescription: true,
        subsections: [
            {name: 'user_management_users', hasDescription: true},
            {name: 'user_management_groups'},
            {name: 'user_management_teams'},
            {name: 'user_management_channels'},
            {name: 'user_management_permissions'},
            {name: 'user_management_system_roles', disabled: true},
        ],
    },
    {
        name: 'environment',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'site',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'authentication',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'plugins',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'integrations',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'compliance',
        hasDescription: true,
        subsections: [],
    },
    {
        name: 'experimental',
        hasDescription: true,
        subsections: [],
    },
];

const SECTIONS_BY_ROLES: Record<string, Record<string, boolean>> = {
    [Constants.PERMISSIONS_SYSTEM_USER_MANAGER]: {
        user_management: true,
        authentication: true,
    },
};

const getPermissionsMap = memoizeResult((permissions: string[]) => {
    return permissions.reduce((permissionsMap, permission) => {
        permissionsMap[permission] = true;
        return permissionsMap;
    }, {} as Record<string, boolean>);
});

const getSectionsListForRole = memoizeResult((sections: SystemSection[], roleName: string, sectionsByRole: Record<string, Record<string, boolean>>) => {
    return sections.filter((section) => (!sectionsByRole[roleName] || sectionsByRole[roleName][section.name]));
});

export default class SystemRolePermissions extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            visibleSections: {},
        };
    }

    updatePermissions = (permissions: PermissionToUpdate[]) => {
        this.props.updatePermissions(permissions);
    }

    setSectionVisible = (name: string, visible: boolean) => {
        const {visibleSections} = this.state;
        this.setState({
            visibleSections: {
                ...visibleSections,
                [name]: visible,
            },
        });
    }

    getRows = (permissionsMap: Record<string, boolean>, permissionsToUpdate: PermissionsToUpdate, visibleSections: Record<string, boolean>) => {
        let editedSectionsByRole = {
            ...SECTIONS_BY_ROLES,
        };

        if (this.props.role.name === Constants.PERMISSIONS_SYSTEM_USER_MANAGER) {
            let permissionsToShow: Record<string, boolean> = {};
            Object.keys(permissionsMap).forEach((permission) => {
                if (permission.startsWith('sysconsole_')) {
                    const permissionShortName = permission.replace(/sysconsole_(read|write)_/, '');
                    permissionsToShow = {
                        ...permissionsToShow,
                        [permissionShortName]: true,
                    };
                }
            });

            editedSectionsByRole = {
                [Constants.PERMISSIONS_SYSTEM_USER_MANAGER]: {
                    ...editedSectionsByRole[Constants.PERMISSIONS_SYSTEM_USER_MANAGER],
                    ...permissionsToShow,
                },
            };
        }

        return getSectionsListForRole(sectionsList, this.props.role.name, editedSectionsByRole).map((section: SystemSection) => {
            return (
                <SystemRolePermission
                    key={section.name}
                    section={section}
                    permissionsMap={permissionsMap}
                    permissionsToUpdate={permissionsToUpdate}
                    visibleSections={visibleSections}
                    setSectionVisible={this.setSectionVisible}
                    updatePermissions={this.props.updatePermissions}
                    readOnly={this.props.readOnly}
                />
            );
        });
    }

    render() {
        const {role, permissionsToUpdate} = this.props;
        const {visibleSections} = this.state;
        const permissionsMap = getPermissionsMap(role.permissions);
        return (
            <AdminPanel
                id='SystemRolePermissions'
                titleId={t('admin.permissions.system_role_permissions.title')}
                titleDefault='Privileges'
                subtitleId={t('admin.permissions.system_role_permissions.description')}
                subtitleDefault='Level of access to the system console.'
            >
                <div className='SystemRolePermissions'>
                    {this.getRows(permissionsMap, permissionsToUpdate, visibleSections)}
                </div>
            </AdminPanel>
        );
    }
}

t('admin.permissions.sysconsole_section_about.name');
t('admin.permissions.sysconsole_section_about.description');
t('admin.permissions.sysconsole_section_billing.name');
t('admin.permissions.sysconsole_section_billing.description');
t('admin.permissions.sysconsole_section_reporting.name');
t('admin.permissions.sysconsole_section_reporting.description');
t('admin.permissions.sysconsole_section_user_management.name');
t('admin.permissions.sysconsole_section_user_management.description');
t('admin.permissions.sysconsole_section_user_management_users.name');
t('admin.permissions.sysconsole_section_user_management_users.description');
t('admin.permissions.sysconsole_section_user_management_groups.name');
t('admin.permissions.sysconsole_section_user_management_teams.name');
t('admin.permissions.sysconsole_section_user_management_channels.name');
t('admin.permissions.sysconsole_section_user_management_permissions.name');
t('admin.permissions.sysconsole_section_user_management_system_roles.name');
t('admin.permissions.sysconsole_section_environment.name');
t('admin.permissions.sysconsole_section_environment.description');
t('admin.permissions.sysconsole_section_site.name');
t('admin.permissions.sysconsole_section_site.description');
t('admin.permissions.sysconsole_section_authentication.name');
t('admin.permissions.sysconsole_section_authentication.description');
t('admin.permissions.sysconsole_section_plugins.name');
t('admin.permissions.sysconsole_section_plugins.description');
t('admin.permissions.sysconsole_section_integrations.name');
t('admin.permissions.sysconsole_section_integrations.description');
t('admin.permissions.sysconsole_section_compliance.name');
t('admin.permissions.sysconsole_section_compliance.description');
t('admin.permissions.sysconsole_section_experimental.name');
t('admin.permissions.sysconsole_section_experimental.description');
