// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership} from 'mattermost-redux/types/teams';
import {ChannelMembership} from 'mattermost-redux/types/channels';

import * as Utils from 'utils/utils.jsx';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';

type Props = {
    user: UserProfile;
    membership?: TeamMembership | ChannelMembership;
    handleUpdateMembership: (role: Role) => void;
}

export type Role = 'system_admin' | 'team_admin' | 'team_user' | 'channel_admin' | 'channel_user' | 'guest';

export default class UserGridRoleDropdown extends React.Component<Props> {
    private getScope = (): 'team' | 'channel' => {
        if (!this.props.membership) {
            return 'team';
        }
        return 'team_id' in this.props.membership ? 'team' : 'channel';
    }

    private getDropDownOptions = () => {
        if (this.getScope() === 'team') {
            return {
                makeAdmin: Utils.localizeMessage('team_members_dropdown.makeAdmin', 'Make Team Admin'),
                makeMember: Utils.localizeMessage('team_members_dropdown.makeMember', 'Make Team Member'),
            };
        }

        return {
            makeAdmin: Utils.localizeMessage('channel_members_dropdown.make_channel_admin', 'Make Team Admin'),
            makeMember: Utils.localizeMessage('channel_members_dropdown.make_channel_member', 'Make Channel Member'),
        };
    }

    private getCurrentRole = (): Role => {
        const {user, membership} = this.props;

        if (user.roles.includes('system_admin')) {
            return 'system_admin';
        } else if (membership) {
            if (membership.roles.includes('team_admin')) {
                return 'team_admin';
            } else if (membership.roles.includes('team_user')) {
                return 'team_user';
            } else if (membership.roles.includes('channel_admin')) {
                return 'channel_admin';
            } else if (membership.roles.includes('channel_user')) {
                return 'channel_user';
            }
        }

        return 'guest';
    }

    private getLocalizedRole = (role: Role) => {
        switch (role) {
        case 'system_admin':
            return Utils.localizeMessage('admin.user_grid.system_admin', 'System Admin');
        case 'team_admin':
            return Utils.localizeMessage('admin.user_grid.team_admin', 'Team Admin');
        case 'team_user':
            return Utils.localizeMessage('admin.user_grid.team_member', 'Team Member');
        case 'channel_admin':
            return Utils.localizeMessage('admin.user_grid.channel_admin', 'Channel Admin');
        case 'channel_user':
            return Utils.localizeMessage('admin.user_grid.channel_member', 'Channel Member');
        default:
            return Utils.localizeMessage('admin.user_grid.guest', 'Guest');
        }
    }

    private handleUpdateMembership = (role: 'admin' | 'user') => {
        const scope = this.getScope();
        let updateRole: Role;
        if (role === 'admin') {
            updateRole = scope === 'team' ? 'team_admin' : 'channel_admin';
        } else {
            updateRole = scope === 'team' ? 'team_user' : 'channel_user';
        }
        this.props.handleUpdateMembership(updateRole);
    }

    public render = (): JSX.Element | null => {
        if (!this.props.membership) {
            return null;
        }

        const {user} = this.props;

        const {makeAdmin, makeMember} = this.getDropDownOptions();
        const currentRole = this.getCurrentRole();
        const localizedRole = this.getLocalizedRole(currentRole);

        const dropdownEnabled = !['system_admin', 'guest'].includes(currentRole);
        const showMakeAdmin = ['channel_user', 'team_user'].includes(currentRole);
        const showMakeMember = ['channel_admin', 'team_admin'].includes(currentRole);

        if (!dropdownEnabled) {
            return localizedRole;
        }

        return (
            <MenuWrapper>
                <button
                    id={`user_grid_role_dropdown_${user.username}`}
                    className='dropdown-toggle theme color--link style--none'
                    type='button'
                    aria-expanded='true'
                >
                    <span>{localizedRole} </span>
                    <DropdownIcon/>
                </button>
                <Menu ariaLabel={Utils.localizeMessage('team_members_dropdown.menuAriaLabel', 'Change the role of a team member')}>
                    <Menu.ItemAction
                        show={showMakeAdmin}
                        onClick={() => this.handleUpdateMembership('admin')}
                        text={makeAdmin}
                    />
                    <Menu.ItemAction
                        show={showMakeMember}
                        onClick={() => this.handleUpdateMembership('user')}
                        text={makeMember}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}
