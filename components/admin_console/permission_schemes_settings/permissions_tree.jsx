// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import PermissionGroup from './permission_group.jsx';

const GROUPS = [
    {
        code: 'teams',
        permissions: [
            {
                code: 'send_invites',
                combined: true,
                permissions: [
                    'invite_user',
                    'get_public_link',
                    'add_user_to_team',
                ],
            },
            'create_team',
        ],
    },
    {
        code: 'public_channel',
        permissions: [
            'create_public_channel',
            'manage_public_channel_properties',
            'manage_public_channel_members',
            'delete_public_channel',
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
            'edit_post',
            {
                code: 'delete_posts',
                permissions: [
                    'delete_post',
                    'delete_others_posts',
                ],
            },
            {
                code: 'reactions',
                permissions: [
                    'add_reaction',
                    'remove_reaction',
                ],
            },
        ],
    },
    {
        code: 'integrations',
        permissions: [
            'manage_webhooks',
            'manage_oauth',
            'manage_slash_commands',
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

    toggleGroup = (codes) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onToggle(this.props.role.name, codes);
    }

    render = () => {
        return (
            <div className='permissions-tree'>
                <div className='permissions-tree--header'>
                    <div className='permission-name'>{'Permission'}</div>
                    <div className='permission-description'>{'Description'}</div>
                </div>
                <div className='permissions-tree--body'>
                    <PermissionGroup
                        key='all'
                        code='all'
                        readOnly={this.props.readOnly}
                        permissions={GROUPS}
                        role={this.props.role}
                        parentRole={this.props.parentRole}
                        scope={this.props.scope}
                        combined={false}
                        onChange={this.toggleGroup}
                        root={true}
                    />
                </div>
            </div>
        );
    };
}
