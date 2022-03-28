// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';
import {ClientLicense} from 'mattermost-redux/types/config';
import {LicenseSkus} from 'mattermost-redux/types/general';

import {Role} from 'mattermost-redux/types/roles';

import PermissionGroup from './permission_group';

interface Props {
    role?: Partial<Role>;
    parentRole: any;
    scope: string;
    selectRow: any;
    readOnly: boolean;
    onToggle: (a: string, b: string[]) => void;
    license: ClientLicense;
}

const PermissionsTreePlaybooks = (props: Props) => {
    const toggleGroup = (ids: string[]) => {
        if (props.readOnly) {
            return;
        }
        props.onToggle(props.role?.name || '', ids);
    };

    const groups = [
        {
            id: 'playbook_public',
            permissions: [
                Permissions.PLAYBOOK_PUBLIC_MANAGE_PROPERTIES,
                Permissions.PLAYBOOK_PUBLIC_MANAGE_MEMBERS,
            ],
        },
        {
            id: 'runs',
            permissions: [
                Permissions.RUN_CREATE,
            ],
        },
    ];

    if (props.license?.SkuShortName === LicenseSkus.Enterprise) {
        const playbookPublicIndex = groups.findIndex((group) => group.id === 'playbook_public');
        if (playbookPublicIndex >= 0) {
            groups[playbookPublicIndex].permissions.push(Permissions.PLAYBOOK_PUBLIC_MAKE_PRIVATE);
            groups.splice(playbookPublicIndex + 1, 0, {
                id: 'playbook_private',
                permissions: [
                    Permissions.PLAYBOOK_PRIVATE_MANAGE_PROPERTIES,
                    Permissions.PLAYBOOK_PRIVATE_MANAGE_MEMBERS,
                    Permissions.PLAYBOOK_PRIVATE_MAKE_PUBLIC,
                ],
            });
        }
    }

    return (
        <div className='permissions-tree'>
            <div className='permissions-tree--header'>
                <div className='permission-name'>
                    <FormattedMessage
                        id='admin.permissions.permissionsTree.permission'
                        defaultMessage='Permission'
                    />
                </div>
                <div className='permission-description'>
                    <FormattedMessage
                        id='admin.permissions.permissionsTree.description'
                        defaultMessage='Description'
                    />
                </div>
            </div>
            <div className='permissions-tree--body'>
                <PermissionGroup
                    key='all'
                    id='all'
                    parentRole={props.parentRole}
                    uniqId={props.role?.name}
                    selectRow={props.selectRow}
                    readOnly={props.readOnly}
                    permissions={groups}
                    role={props.role}
                    scope={props.scope}
                    combined={false}
                    onChange={toggleGroup}
                    root={true}
                />
            </div>
        </div>
    );
};

export default PermissionsTreePlaybooks;
