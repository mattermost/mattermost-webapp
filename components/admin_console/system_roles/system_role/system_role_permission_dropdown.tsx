// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';

import * as Utils from 'utils/utils.jsx';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';

import {noAccess, PermissionAccess, PermissionsToUpdate, writeAccess, readAccess, PermissionToUpdate, SystemSection} from './types';

import './system_role_permissions.scss';

type Props = {
    permissions: Record<string, boolean>;
    section: SystemSection;
    permissionsToUpdate: PermissionsToUpdate;
    updatePermissions: (permissions: PermissionToUpdate[]) => void;
    isDisabled?: boolean;
}

export default class SystemRolePermissionDropdown extends React.PureComponent<Props> {
    updatePermission = (value: PermissionAccess) => {
        const section = this.props.section;
        const permissions: PermissionToUpdate[] = [];
        if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach(({name, disabled}) => {
                if (!disabled) {
                    permissions.push({name, value});
                }
            });
        } else {
            permissions.push({name: section.name, value});
        }
        this.props.updatePermissions(permissions);
    }

    renderOption = (label: JSX.Element, description: JSX.Element) => {
        return (
            <div className='PermissionSectionDropdownOptions'>
                <div className='PermissionSectionDropdownOptions_label'>
                    {label}
                </div>
                <div className='PermissionSectionDropdownOptions_description'>
                    {description}
                </div>
            </div>
        );
    }

    getAccessForSection = (sectionName: string, permissions: Record<string, boolean>, permissionsToUpdate: Record<string, PermissionAccess>) => {
        // Assume sysadmin has write access for everything, this is a bit of a hack but it should be left in until `user_management_read|write_system_roles` is actually a permission
        if (permissions[Permissions.MANAGE_SYSTEM]) {
            return writeAccess;
        }

        let access: PermissionAccess = false;
        if (sectionName in permissionsToUpdate) {
            access = permissionsToUpdate[sectionName];
        } else {
            if (permissions[`sysconsole_read_${sectionName}`] === true) {
                access = readAccess;
            }

            if (permissions[`sysconsole_write_${sectionName}`] === true) {
                access = writeAccess;
            }
        }

        return access;
    }

    render() {
        const {isDisabled, section, permissionsToUpdate, permissions} = this.props;

        const canWriteLabel = (
            <FormattedMessage
                id={'admin.permissions.system_role_permissions.write.title'}
                defaultMessage='Can edit'
            />
        );

        const canWriteDescription = (
            <FormattedMessage
                id={'admin.permissions.system_role_permissions.write.description'}
                defaultMessage='Can add, edit and delete anything in this section.'
            />
        );

        const canReadLabel = (
            <FormattedMessage
                id={'admin.permissions.system_role_permissions.read.title'}
                defaultMessage='Read only'
            />
        );
        const canReadDescription = (
            <FormattedMessage
                id={'admin.permissions.system_role_permissions.read.description'}
                defaultMessage={'Can view this section but can\'t edit anything in it'}
            />
        );

        const noAccessLabel = (
            <FormattedMessage
                id={'admin.permissions.system_role_permissions.no_access.title'}
                defaultMessage='No access'
            />
        );

        const mixedAccessLabel = (
            <FormattedMessage
                id={'admin.permissions.system_role_permissions.mixed_access.title'}
                defaultMessage='Mixed access'
            />
        );

        const noAccessDescription = (
            <FormattedMessage
                id={'admin.permissions.system_role_permissions.no_access.description'}
                defaultMessage={'No access to this section and it will be hidden in the navigation.'}
            />
        );

        let currentAccess = noAccessLabel;

        // If we have subsections then use them to determine access to show.
        if (section.subsections && section.subsections.length > 0) {
            let hasNoAccess = false;
            let canRead = false;
            let canWrite = false;
            section.subsections.forEach((subsection) => {
                switch (this.getAccessForSection(subsection.name, permissions, permissionsToUpdate)) {
                case readAccess:
                    canRead = true;
                    break;
                case writeAccess:
                    canWrite = true;
                    break;
                default:
                    hasNoAccess = true;
                    break;
                }
            });

            // If the role has more than one type of access across the subsection then mark it as mixed access.
            if ([canRead, canWrite, hasNoAccess].filter((val) => val).length > 1) {
                currentAccess = mixedAccessLabel;
            } else if (canRead) {
                currentAccess = canReadLabel;
            } else if (canWrite) {
                currentAccess = canWriteLabel;
            } else if (hasNoAccess) {
                currentAccess = noAccessLabel;
            }
        } else {
            switch (this.getAccessForSection(section.name, permissions, permissionsToUpdate)) {
            case readAccess:
                currentAccess = canReadLabel;
                break;
            case writeAccess:
                currentAccess = canWriteLabel;
                break;
            default:
                currentAccess = noAccessLabel;
                break;
            }
        }

        const ariaLabel = Utils.localizeMessage('admin.permissions.system_role_permissions.change_access', 'Change role access on a system console section');
        return (
            <MenuWrapper
                isDisabled={isDisabled}
            >
                <button
                    id={`systemRolePermissionDropdown${section.name}`}
                    className='PermissionSectionDropdownButton dropdown-toggle theme'
                    type='button'
                    aria-expanded='true'
                >
                    <div className='PermissionSectionDropdownButton_text'>
                        {currentAccess}
                    </div>
                    <div className='PermissionSectionDropdownButton_icon'>
                        <DropdownIcon/>
                    </div>
                </button>
                <Menu ariaLabel={ariaLabel}>
                    <Menu.ItemAction
                        onClick={() => this.updatePermission(writeAccess)}
                        text={this.renderOption(canWriteLabel, canWriteDescription)}
                    />
                    <Menu.ItemAction
                        onClick={() => this.updatePermission(readAccess)}
                        text={this.renderOption(canReadLabel, canReadDescription)}
                    />
                    <Menu.ItemAction
                        onClick={() => this.updatePermission(noAccess)}
                        text={this.renderOption(noAccessLabel, noAccessDescription)}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}
