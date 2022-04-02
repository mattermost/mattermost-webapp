// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';
import {Role} from 'mattermost-redux/types/roles';
import {ClientLicense} from 'mattermost-redux/types/config';

import PermissionGroup from '../permission_group.jsx';
import EditPostTimeLimitButton from '../edit_post_time_limit_button';
import EditPostTimeLimitModal from '../edit_post_time_limit_modal';

type Props = {
    license: ClientLicense;
    onToggle: (role: string, permissions: string[]) => void;
    readOnly: boolean;
    scope: string;
    selectRow: (permission: string) => void;
    parentRole?: Role;
    selected?: string | null;
    role?: Partial<Role>;
}

const GuestPermissionsTree = ({license, onToggle, readOnly, scope, selectRow, parentRole, selected, role = {permissions: []}}: Props) => {
    const [editTimeLimitModalIsVisible, setEditTimeLimitModalIsVisible] = React.useState(false);

    const openPostTimeLimitModal = () => setEditTimeLimitModalIsVisible(true);
    const closePostTimeLimitModal = () => setEditTimeLimitModalIsVisible(false);
    const toggleGroup = (ids: string[]) => {
        if (readOnly) {
            return;
        }
        onToggle(role.name!, ids);
    };

    const ADDITIONAL_VALUES = {
        guest_edit_post: {
            editTimeLimitButton: (
                <EditPostTimeLimitButton
                    onClick={openPostTimeLimitModal}
                    isDisabled={readOnly}
                />
            ),
        },
    };

    let permissions = [
        Permissions.CREATE_PRIVATE_CHANNEL,
        Permissions.EDIT_POST,
        Permissions.DELETE_POST,
        {
            id: 'guest_reactions',
            combined: true,
            permissions: [
                Permissions.ADD_REACTION,
                Permissions.REMOVE_REACTION,
            ],
        },
        Permissions.USE_CHANNEL_MENTIONS,
    ];

    if (license && license.IsLicensed === 'true' && license.LDAPGroups === 'true') {
        permissions.push(Permissions.USE_GROUP_MENTIONS);
    }
    permissions.push(Permissions.CREATE_POST);
    permissions = permissions.map((permission) => {
        if (typeof (permission) === 'string') {
            return {
                id: `guest_${permission}`,
                combined: true,
                permissions: [permission],
            };
        }
        return permission;
    });

    return (
        <div className='permissions-tree guest'>
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
                    uniqId={role.name}
                    selected={selected}
                    selectRow={selectRow}
                    readOnly={readOnly}
                    permissions={permissions}
                    additionalValues={ADDITIONAL_VALUES}
                    role={role}
                    parentRole={parentRole}
                    scope={scope}
                    combined={false}
                    onChange={toggleGroup}
                    root={true}
                />
            </div>
            <EditPostTimeLimitModal
                onClose={closePostTimeLimitModal}
                show={editTimeLimitModalIsVisible}
            />
        </div>
    );
};

export default GuestPermissionsTree;
