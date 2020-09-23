// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {Role} from 'mattermost-redux/types/roles';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';

import SystemRolePermissionDropdown from './system_role_permission_dropdown';
import {PermissionsToUpdate, PermissionToUpdate} from './types';

import './system_role_permissions.scss';

type Props = {
    role: Role;
    permissionsToUpdate: PermissionsToUpdate;
    updatePermissions: (permissions: PermissionToUpdate[]) => void;
    readOnly?: boolean;
}

type State = {
    visibleSection: string;
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

export type SystemSection = {
    name: string;
    hasDescription?: boolean;
    subsections?: SystemSection[];
}

const getPermissionsMap = memoizeResult((permissions: string[]) => {
    return permissions.reduce((permissionsMap, permission) => {
        permissionsMap[permission] = true;
        return permissionsMap;
    }, {} as Record<string, boolean>);
});

export default class SystemRolePermissions extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            visibleSection: '',
        };
    }

    updatePermissions = (permissions: PermissionToUpdate[]) => {
        this.props.updatePermissions(permissions);
    }

    renderSectionRow = (section: SystemSection, permissionsMap: Record<string, boolean>, permissionsToUpdate: PermissionsToUpdate) => {
        return (
            <div className='PermissionSection'>
                <div className='PermissionSectionText'>
                    <div className='PermissionSectionText_title'>
                        <FormattedMessage
                            id={`admin.permissions.sysconsole_section_${section.name}.name`}
                            defaultMessage={section.name}
                        />
                    </div>

                    {section.hasDescription &&
                        <div className='PermissionSection_description'>
                            <FormattedMessage
                                id={`admin.permissions.sysconsole_section_${section.name}.description`}
                                defaultMessage={''}
                            />
                        </div>
                    }
                </div>
                <div className='PermissionSectionDropdown'>
                    <SystemRolePermissionDropdown
                        permissions={permissionsMap}
                        section={section}
                        updatePermissions={this.updatePermissions}
                        permissionsToUpdate={permissionsToUpdate}
                        isDisabled={this.props.readOnly}
                    />
                </div>
            </div>
        );
    }

    toggleSectionVisible = (name: string) => {
        let {visibleSection} = this.state;
        if (visibleSection === name) {
            visibleSection = '';
        } else {
            visibleSection = name;
        }

        this.setState({visibleSection});
    }

    renderSubsections = (section: SystemSection, permissionsMap: Record<string, boolean>, permissionsToUpdate: PermissionsToUpdate, visibleSection: string) => {
        if (!section.subsections || section.subsections.length === 0) {
            return null;
        }

        const isSectionVisible = visibleSection === section.name;
        const chevron = isSectionVisible ? (<i className='Icon icon-chevron-up'/>) : (<i className='Icon icon-chevron-down'/>);
        const message = isSectionVisible ? (
            <FormattedMessage
                id='admin.permissions.system_role_permissions.hide_subsections'
                defaultMessage='Hide {subsectionsCount} subsections'
                values={{subsectionsCount: section.subsections.length}}
            />
        ) : (
            <FormattedMessage
                id='admin.permissions.system_role_permissions.show_subsections'
                defaultMessage='Show {subsectionsCount} subsections'
                values={{subsectionsCount: section.subsections.length}}
            />
        );
        return (
            <div key={section.name}>
                <div className='PermissionSubsectionsToggle'>
                    <button
                        onClick={() => {
                            this.toggleSectionVisible(section.name);
                        }}
                        className='dropdown-toggle theme color--link style--none'
                    >
                        {message}
                        {chevron}
                    </button>
                </div>
                {isSectionVisible &&
                    <div className='PermissionSubsections'>
                        {section.subsections.map((subsection) => this.renderSectionRow(subsection, permissionsMap, permissionsToUpdate))}
                    </div>
                }
            </div>
        );
    }

    getRows = (permissionsMap: Record<string, boolean>, permissionsToUpdate: PermissionsToUpdate, visibleSection: string) => {
        return sectionsList.map((section: SystemSection) => {
            return (
                <div
                    key={section.name}
                    className='PermissionRow'
                >
                    {this.renderSectionRow(section, permissionsMap, permissionsToUpdate)}
                    {this.renderSubsections(section, permissionsMap, permissionsToUpdate, visibleSection)}
                </div>
            );
        });
    }

    render() {
        const {role, permissionsToUpdate} = this.props;
        const {visibleSection} = this.state;
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
                    {this.getRows(permissionsMap, permissionsToUpdate, visibleSection)}
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
