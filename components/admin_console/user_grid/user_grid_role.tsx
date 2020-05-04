// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership} from 'mattermost-redux/types/teams';

import * as Utils from 'utils/utils.jsx';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';

type Props = {
    user: UserProfile;
    membership?: TeamMembership;
}

const roleMessages = {
    system_admin: {
        id: 'admin.user_grid.system_admin_role',
        defaultMessage: 'System Admin',
    }
}

export default class UserGridRole extends React.Component<Props> {
    getDropDownOptions() {

    }

    handleMakeAdmin() {

    }

    handleMakeMember() {

    }

    render() {
        let {user, membership} = this.props;
        let currentRole: JSX.Element = (
            <FormattedMessage
                id='admin.user_grid._role'
                defaultMessage='Guest'
            />
        );

        if (user.roles.includes('system_admin')) {
            currentRole = (<FormattedMessage
                id='admin.user_grid.system_admin_role'
                defaultMessage='System Admin'
            />);
        } else if (membership) {
            if (membership.roles.includes('team_admin')) {
                currentRole = (<FormattedMessage
                    id='admin.user_grid.team_admin_role'
                    defaultMessage='Team Admin'
                />);
            } else if (membership.roles.includes('team_user')) {
                currentRole = (<FormattedMessage
                    id='admin.user_grid.team_member_role'
                    defaultMessage='Team Member'
                />);
            }

            if (membership.roles.includes('channel_admin')) {
                currentRole = (<FormattedMessage
                    id='admin.user_grid.channel_admin_role'
                    defaultMessage='Channel Admin'
                />);
            } else if (membership.roles.includes('channel_user')) {
                currentRole = (<FormattedMessage
                    id='admin.user_grid.channel_member_role'
                    defaultMessage='Channel Member'
                />);
            }
        }


        // return role;

        const showMakeAdmin = true;
        const showMakeMember = true;

        return (
            <MenuWrapper>
                <button
                    id={`user_grid_role_dropdown_${user.username}`}
                    className='dropdown-toggle theme color--link style--none'
                    type='button'
                    aria-expanded='true'
                >
                    <span>{currentRole} </span>
                    <DropdownIcon/>
                </button>
                <div>
                    <Menu
                        openLeft={true}
                        ariaLabel={Utils.localizeMessage('team_members_dropdown.menuAriaLabel', 'Change the role of a team member')}
                    >
                        <Menu.ItemAction
                            show={showMakeAdmin}
                            onClick={this.handleMakeAdmin}
                            text={Utils.localizeMessage('team_members_dropdown.makeAdmin', 'Make Team Admin')}
                        />
                        <Menu.ItemAction
                            show={showMakeMember}
                            onClick={this.handleMakeMember}
                            text={Utils.localizeMessage('team_members_dropdown.makeMember', 'Make Member')}
                        />
                    </Menu>
                </div>
            </MenuWrapper>
        );
    }
}
