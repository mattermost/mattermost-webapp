// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Role} from 'mattermost-redux/types/roles';

import {FormattedMessage} from 'react-intl';

import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';

import SystemRolePermissionDropdown from './system_role_permission_dropdown';

import './system_role_permissions.scss';

type Props = {
    role: Role;
    permissionsToUpdate: Record<string, 'read' | 'write' | false>;
    updatePermission: (name: string, value: 'read' | 'write' | false) => void;
}

// the actual permissions correlating to these values are of the format `sysconsole_(read|write)_name(.subsection.name)`
const sectionsList: SystemSection[] = [
    {
        name: 'about',
        subsections: [],
    },

    // {
    //     name: 'billing',
    //     subsections: [],
    // },
    {
        name: 'reporting',
        subsections: [],
    },
    {
        name: 'user_management',
        subsections: [
            {name: 'users'},
            {name: 'groups'},
            {name: 'teams'},
            {name: 'channels'},
            {name: 'permissions'},
        ],
    },
    {
        name: 'environment',
        subsections: [],
    },
    {
        name: 'site',
        subsections: [],
    },
    {
        name: 'authentication',
        subsections: [],
    },
    {
        name: 'plugins',
        subsections: [],
    },
    {
        name: 'integrations',
        subsections: [],
    },
    {
        name: 'compliance',
        subsections: [],
    },
    {
        name: 'experimental',
        subsections: [],
    },
];

type SystemSubSection = {
    name: string;
}

export type SystemSection = {
    name: string;
    subsections: SystemSubSection[];
}

const getPermissionsMap = memoizeResult((permissions: string[]) => {
    return permissions.reduce((permissionsMap, permission) => {
        permissionsMap[permission] = true;
        return permissionsMap;
    }, {} as Record<string, boolean>);
});

export default class SystemRolePermissions extends React.PureComponent<Props> {
    updatePermission = (name: string, value: 'read' | 'write' | false) => {
        this.props.updatePermission(name, value);
    }

    getRows = (permissionsMap: Record<string, boolean>) => {
        return sectionsList.map((section: SystemSection) => {
            return (
                <div
                    key={section.name}
                    className='PermissionSection'
                >
                    <div className='PermissionSectionText'>
                        <div className='PermissionSectionText_title'>
                            <FormattedMessage
                                id={`admin.permissions.sysconsole_section_${section.name}.name`}
                                defaultMessage={section.name}
                            />
                        </div>

                        <div className='PermissionSection_description'>
                            <FormattedMessage
                                id={`admin.permissions.sysconsole_section_${section.name}.description`}
                                defaultMessage={section.name}
                            />
                        </div>
                    </div>
                    <div className='PermissionSectionDropdown'>
                        <SystemRolePermissionDropdown
                            permissions={permissionsMap}
                            section={section}
                            updatePermission={this.updatePermission}
                            permissionsToUpdate={this.props.permissionsToUpdate}
                        />
                    </div>
                </div>
            );
        });
    }

    public render() {
        const {role} = this.props;
        const permissionsMap = getPermissionsMap(role.permissions);
        return (
            <AdminPanel
                id='SystemRolePermissions'
                titleId={t('admin.permissions.system_role_permissions.title')}
                titleDefault='Privileges'
                subtitleId={t('admin.permissions.system_role_permissions.description')}
                subtitleDefault={'Level of access to the system console.'}
            >
                <div className='SystemRolePermissions'>
                    {this.getRows(permissionsMap)}
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
