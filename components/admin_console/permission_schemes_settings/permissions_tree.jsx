// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {Permissions} from 'utils/constants.jsx';

import PermissionRow from './permission_row.jsx';
import PermissionGroup from './permission_group.jsx';

const GROUPS = [
    'invite_user',
    'create_direct_channel',
    'create_group_channel',
    'read_channel',
    'get_public_link',
    'create_user_access_token',
    'read_user_access_token',
    'revoke_user_access_token',
    {
        code: 'public_channel',
        permissions: [
            'create_public_channel',
            'manage_public_channel_properties',
            'manage_public_channel_members',
            'delete_public_channel',
            'join_public_channels',
            'read_public_channel',
        ],
    },
    {
        code: 'private_channel',
        permissions: [
            'create_private_channel',
            'manage_private_channel_properties',
            'manage_private_channel_members',
            'delete_private_channel',
        ],
    },
    {
        code: 'posts',
        permissions: [
            'create_post',
            'create_post_public',
            'edit_post',
            'edit_others_posts',
            'delete_post',
            'delete_others_posts',
            'add_reaction',
            'remove_reaction',
            'remove_others_reactions',
            'upload_file',
        ],
    },
    {
        code: 'teams',
        permissions: [
            'create_team',
            'manage_team',
            'import_team',
            'view_team',
            'add_user_to_team',
            'manage_team_roles',
            'list_team_channels',
            'remove_user_from_team',
        ],
    },
    {
        code: 'roles',
        permissions: [
            'manage_roles',
            'manage_channel_roles',
        ],
    },
    {
        code: 'integrations',
        permissions: [
            'manage_webhooks',
            'manage_others_webhooks',
            'manage_oauth',
            'manage_system_wide_oauth',
            'use_slash_commands',
            'manage_slash_commands',
            'manage_others_slash_commands',
        ],
    },
    {
        code: 'system',
        permissions: [
            'manage_system',
            'list_users_without_team',
            'manage_jobs',
            'assign_system_admin_role',
            'permanent_delete_user',
            'edit_other_users',
        ],
    },
];

export default class PermissionsTree extends React.Component {
    static propTypes = {
        scope: PropTypes.string.isRequired,
        role: PropTypes.object.isRequired,
        onToggle: PropTypes.func.isRequired,
        parentRole: PropTypes.object,
        readOnly: PropTypes.bool,
    };

    static defaultProps = {
        role: {
            permissions: [],
        },
    };

    toggleRow = (code) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onToggle(this.props.role.name, [code]);
    }

    toggleGroup = (codes) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onToggle(this.props.role.name, codes);
    }

    fromParent = (code) => {
        return this.props.parentRole && this.props.parentRole.permissions.indexOf(code) !== -1;
    }

    renderGroup = (g) => {
        return (
            <PermissionGroup
                key={g.code}
                code={g.code}
                readOnly={this.props.readOnly}
                permissions={g.permissions}
                role={this.props.role}
                parentRole={this.props.parentRole}
                scope={this.props.scope}
                onChange={this.toggleGroup}
            />
        );
    }

    renderPermission = (permission) => {
        const p = Permissions[permission];
        if (!p) {
            return null;
        }
        if (this.props.scope === 'channel_scope' && p.scope !== 'channel_scope') {
            return null;
        }
        if (this.props.scope === 'team_scope' && p.scope === 'system_scope') {
            return null;
        }
        const comesFromParent = this.fromParent(p.code);
        const active = comesFromParent || this.props.role.permissions.indexOf(p.code) !== -1;
        return (
            <PermissionRow
                key={p.code}
                code={p.code}
                readOnly={this.props.readOnly || comesFromParent}
                inherited={comesFromParent ? this.props.parentRole : null}
                value={active ? 'checked' : ''}
                onChange={this.toggleRow}
            />
        );
    }

    render = () => {
        const permissionsRows = GROUPS.map((group) => {
            if (typeof group === 'string') {
                return this.renderPermission(group);
            }
            return this.renderGroup(group);
        });

        return (
            <div className='permissions-tree'>
                <div className='permissions-tree--header'>
                    <div className='permission-name'>{'Permission'}</div>
                    <div className='permission-description'>{'Description'}</div>
                </div>
                <div className='permissions-tree--body'>
                    {permissionsRows}
                </div>
            </div>
        );
    };
}
