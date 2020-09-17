// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';

import {SystemSection} from './system_role_permissions';

import './system_role_permissions.scss'

type Props = {
    permissions: Record<string, boolean>;
    section: SystemSection;
    permissionsToUpdate: Record<string, 'read' | 'write' | false>;
    updatePermission: (name: string, value: 'read' | 'write' | false) => void;
    isDisabled?: boolean;
}

export default class SystemRolePermissionDropdown extends React.PureComponent<Props> {
    private updatePermission = (value: 'read' | 'write' | false) => {
        const section = this.props.section;
        if (section.subsections.length > 0) {
            section.subsections.forEach(({name}) => {
                this.props.updatePermission(`${section.name}_${name}`, value);
            });
        } else {
            this.props.updatePermission(section.name, value);
        }
    }

    private renderOption = (label: JSX.Element, description: JSX.Element) => {
        return (
            <div className='SystemRolePermissionDropdownOptions'>
                <div className='SystemRolePermissionDropdownOptions_label'>
                    {label}
                </div>
                <div className='SystemRolePermissionDropdownOptions_description'>
                    {description}
                </div>
            </div>
        );
    }

    public render() {
        const {isDisabled, section, permissions, permissionsToUpdate} = this.props;

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

        // If we have subsections then use them to determine access.
        if (section.subsections.length > 0) {
            let hasNoAccess = false;
            let canRead = false;
            let canWrite = false;
            section.subsections.forEach((subsection) => {
                const canWriteSubsection = Boolean(permissions[`sysconsole_write_${section.name}_${subsection.name}`]);
                const canReadSubsection = !canWriteSubsection && Boolean(permissions[`sysconsole_read_${section.name}_${subsection.name}`]);
                hasNoAccess = hasNoAccess || !(canReadSubsection || canWriteSubsection);
                canRead = canRead || canReadSubsection;
                canWrite = canWrite || canWriteSubsection;
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
        } else if (section.name in permissionsToUpdate) {
            switch (permissionsToUpdate[section.name]) {
            case 'read':
                currentAccess = canReadLabel;
                break;
            case 'write':
                currentAccess = canWriteLabel;
                break;
            default:
                currentAccess = noAccessLabel;
                break;
            }
        } else {
            if (permissions[`sysconsole_read_${section.name}`]) {
                currentAccess = canReadLabel;
            }

            if (permissions[`sysconsole_write_${section.name}`]) {
                currentAccess = canWriteLabel;
            }
        }

        const ariaLabel = Utils.localizeMessage('admin.permissions.system_role_permissions.change_access', 'Change role access on a system console section');
        return (
            <MenuWrapper
                isDisabled={isDisabled}
            >
                <button
                    id={`systemRolePermissionDropdown${section.name}`}
                    className='SystemRolePermissionDropdownButton dropdown-toggle theme'
                    type='button'
                    aria-expanded='true'
                >
                    <div className='SystemRolePermissionDropdownButton_text'>
                        {currentAccess}
                    </div>
                    <div className='SystemRolePermissionDropdownButton_icon'>
                        <DropdownIcon/>
                    </div>
                </button>
                <Menu ariaLabel={ariaLabel}>
                    <Menu.ItemAction
                        onClick={() => this.updatePermission('write')}
                        text={this.renderOption(canWriteLabel, canWriteDescription)}
                    />
                    <Menu.ItemAction
                        onClick={() => this.updatePermission('read')}
                        text={this.renderOption(canReadLabel, canReadDescription)}
                    />
                    <Menu.ItemAction
                        onClick={() => this.updatePermission(false)}
                        text={this.renderOption(noAccessLabel, noAccessDescription)}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}
