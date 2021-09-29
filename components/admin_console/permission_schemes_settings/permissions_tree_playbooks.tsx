// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';

import PermissionGroup from './permission_group';

interface Props {
    role: Record<string, string>;
    parentRole: any;
    scope: string;
    selectRow: any;
    readOnly: boolean;
    onToggle: (a: string, b: string[]) => void;
}

export const playbooksGroups: any[] = [
    {
        id: 'playbook_public',
        permissions: [
            Permissions.PLAYBOOK_PUBLIC_MANAGE_PROPERTIES,
            Permissions.PLAYBOOK_PUBLIC_MANAGE_MEMBERS,
            Permissions.PLAYBOOK_PUBLIC_MAKE_PRIVATE,
        ],
    },
    {
        id: 'playbook_private',
        permissions: [
            Permissions.PLAYBOOK_PRIVATE_MANAGE_PROPERTIES,
            Permissions.PLAYBOOK_PRIVATE_MANAGE_MEMBERS,
        ],
    },
    {
        id: 'runs',
        permissions: [
            Permissions.RUN_CREATE,
        ],
    },
];

const PermissionsTreePlaybooks = (props: Props) => {
    const toggleGroup = (ids: string[]) => {
        if (props.readOnly) {
            return;
        }
        props.onToggle(props.role.name, ids);
    };

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
                    uniqId={props.role.name}
                    selectRow={props.selectRow}
                    readOnly={props.readOnly}
                    permissions={playbooksGroups}
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
