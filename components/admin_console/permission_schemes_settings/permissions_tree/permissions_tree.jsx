// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';

import PermissionGroup from '../permission_group.jsx';

import EditPostTimeLimitButton from '../edit_post_time_limit_button';
import EditPostTimeLimitModal from '../edit_post_time_limit_modal';

export default class PermissionsTree extends React.PureComponent {
    static propTypes = {
        scope: PropTypes.string.isRequired,
        config: PropTypes.object.isRequired,
        role: PropTypes.object.isRequired,
        onToggle: PropTypes.func.isRequired,
        parentRole: PropTypes.object,
        selected: PropTypes.string,
        selectRow: PropTypes.func.isRequired,
        readOnly: PropTypes.bool,
        license: PropTypes.object,
    };

    static defaultProps = {
        role: {
            permissions: [],
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            editTimeLimitModalIsVisible: false,
        };

        this.ADDITIONAL_VALUES = {
            edit_post: {
                editTimeLimitButton: (
                    <EditPostTimeLimitButton
                        onClick={this.openPostTimeLimitModal}
                        isDisabled={this.props.readOnly}
                    />
                ),
            },
        };

        this.groups = [
            {
                id: 'teams',
                permissions: [
                    {
                        id: 'send_invites',
                        combined: true,
                        permissions: [
                            Permissions.INVITE_USER,
                            Permissions.GET_PUBLIC_LINK,
                            Permissions.ADD_USER_TO_TEAM,
                        ],
                    },
                    Permissions.CREATE_TEAM,
                ],
            },
            {
                id: 'public_channel',
                permissions: [
                    Permissions.CREATE_PUBLIC_CHANNEL,
                    Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES,
                    {
                        id: 'manage_public_channel_members_and_read_groups',
                        combined: true,
                        permissions: [
                            Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
                            Permissions.READ_PUBLIC_CHANNEL_GROUPS,
                        ],
                    },
                    Permissions.DELETE_PUBLIC_CHANNEL,
                    {
                        id: 'convert_public_channel_to_private',
                        combined: true,
                        permissions: [
                            Permissions.CONVERT_PUBLIC_CHANNEL_TO_PRIVATE,
                            Permissions.CONVERT_PRIVATE_CHANNEL_TO_PUBLIC,
                        ],
                    },
                ],
            },
            {
                id: 'private_channel',
                permissions: [
                    Permissions.CREATE_PRIVATE_CHANNEL,
                    Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES,
                    {
                        id: 'manage_private_channel_members_and_read_groups',
                        combined: true,
                        permissions: [
                            Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
                            Permissions.READ_PRIVATE_CHANNEL_GROUPS,
                        ],
                    },
                    Permissions.DELETE_PRIVATE_CHANNEL,
                ],
            },
            {
                id: 'posts',
                permissions: [
                    {
                        id: 'edit_posts',
                        permissions: [
                            Permissions.EDIT_POST,
                            Permissions.EDIT_OTHERS_POSTS,
                        ],
                    },
                    {
                        id: 'delete_posts',
                        permissions: [
                            Permissions.DELETE_POST,
                            Permissions.DELETE_OTHERS_POSTS,
                        ],
                    },
                    {
                        id: 'reactions',
                        combined: true,
                        permissions: [
                            Permissions.ADD_REACTION,
                            Permissions.REMOVE_REACTION,
                        ],
                    },
                    Permissions.USE_CHANNEL_MENTIONS,
                ],
            },
            {
                id: 'integrations',
                permissions: [
                ],
            },
            {
                id: 'manage_shared_channels',
                permissions: [
                ],
            },
        ];
        this.updateGroups();
    }

    updateGroups = () => {
        const {config, scope, license} = this.props;
        const sharedChannelsGroup = this.groups[this.groups.length - 1];
        const integrationsGroup = this.groups[this.groups.length - 2];
        const postsGroup = this.groups[this.groups.length - 3];
        const teamsGroup = this.groups[0];
        if (config.EnableIncomingWebhooks === 'true' && !integrationsGroup.permissions.includes(Permissions.MANAGE_INCOMING_WEBHOOKS)) {
            integrationsGroup.permissions.push(Permissions.MANAGE_INCOMING_WEBHOOKS);
        }
        if (config.EnableOutgoingWebhooks === 'true' && !integrationsGroup.permissions.includes(Permissions.MANAGE_OUTGOING_WEBHOOKS)) {
            integrationsGroup.permissions.push(Permissions.MANAGE_OUTGOING_WEBHOOKS);
        }
        if (config.EnableOAuthServiceProvider === 'true' && !integrationsGroup.permissions.includes(Permissions.MANAGE_OAUTH)) {
            integrationsGroup.permissions.push(Permissions.MANAGE_OAUTH);
        }
        if (config.EnableCommands === 'true' && !integrationsGroup.permissions.includes(Permissions.MANAGE_SLASH_COMMANDS)) {
            integrationsGroup.permissions.push(Permissions.MANAGE_SLASH_COMMANDS);
        }
        if (config.EnableCustomEmoji === 'true' && !integrationsGroup.permissions.includes(Permissions.CREATE_EMOJIS)) {
            integrationsGroup.permissions.push(Permissions.CREATE_EMOJIS);
        }
        if (config.EnableCustomEmoji === 'true' && !integrationsGroup.permissions.includes(Permissions.DELETE_EMOJIS)) {
            integrationsGroup.permissions.push(Permissions.DELETE_EMOJIS);
        }
        if (config.EnableCustomEmoji === 'true' && !integrationsGroup.permissions.includes(Permissions.DELETE_OTHERS_EMOJIS)) {
            integrationsGroup.permissions.push(Permissions.DELETE_OTHERS_EMOJIS);
        }
        if (config.EnableGuestAccounts === 'true' && !teamsGroup.permissions.includes(Permissions.INVITE_GUEST)) {
            teamsGroup.permissions.push(Permissions.INVITE_GUEST);
        }
        if (scope === 'team_scope' && this.groups[0].id !== 'teams_team_scope') {
            this.groups[0].id = 'teams_team_scope';
        }
        if (license?.IsLicensed === 'true' && license?.LDAPGroups === 'true' && !postsGroup.permissions.includes(Permissions.USE_GROUP_MENTIONS)) {
            postsGroup.permissions.push(Permissions.USE_GROUP_MENTIONS);
        }
        postsGroup.permissions.push(Permissions.CREATE_POST);

        if (config.ExperimentalSharedChannels === 'true') {
            sharedChannelsGroup.permissions.push(Permissions.MANAGE_SHARED_CHANNELS);
        }
    }

    openPostTimeLimitModal = () => {
        this.setState({editTimeLimitModalIsVisible: true});
    }

    closePostTimeLimitModal = () => {
        this.setState({editTimeLimitModalIsVisible: false});
    }

    componentDidUpdate(prevProps) {
        if (this.props.config !== prevProps.config || this.props.license !== prevProps.license) {
            this.updateGroups();
        }
    }

    toggleGroup = (ids) => {
        if (this.props.readOnly) {
            return;
        }
        this.props.onToggle(this.props.role.name, ids);
    }

    render = () => {
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
                        uniqId={this.props.role.name}
                        selected={this.props.selected}
                        selectRow={this.props.selectRow}
                        readOnly={this.props.readOnly}
                        permissions={this.groups}
                        additionalValues={this.ADDITIONAL_VALUES}
                        role={this.props.role}
                        parentRole={this.props.parentRole}
                        scope={this.props.scope}
                        combined={false}
                        onChange={this.toggleGroup}
                        root={true}
                    />
                </div>
                <EditPostTimeLimitModal
                    onClose={this.closePostTimeLimitModal}
                    show={this.state.editTimeLimitModalIsVisible}
                />
            </div>
        );
    };
}
