// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import * as Utils from 'utils/utils.jsx';

import * as UserUtils from 'mattermost-redux/utils/user_utils';
import {UserProfile} from 'mattermost-redux/types/users';
import {Team, TeamMembership} from 'mattermost-redux/types/teams';
import {ActionResult} from 'mattermost-redux/types/actions';

type Props = {
    team: Team;
    user: UserProfile;
    teamMember: TeamMembership;
    onError: (error: {message: string}) => void;
    onMemberChange: (teamId: string) => void;
    updateTeamMemberSchemeRoles: (teamId: string, userId: string, isSchemeUser: boolean, isSchemeAdmin: boolean,) => Promise<ActionResult>;
    handleRemoveUserFromTeam: (teamId: string) => void;
}

const ManageTeamsDropdown = (props: Props) => {
    const makeTeamAdmin = async () => {
        const {error} = await props.updateTeamMemberSchemeRoles(props.teamMember.team_id, props.user.id, true, true);
        if (error) {
            props.onError(error.message);
        } else {
            props.onMemberChange(props.teamMember.team_id);
        }
    };

    const makeMember = async () => {
        const {error} = await props.updateTeamMemberSchemeRoles(props.teamMember.team_id, props.user.id, true, false);
        if (error) {
            props.onError(error.message);
        } else {
            props.onMemberChange(props.teamMember.team_id);
        }
    };

    const removeFromTeam = () => props.handleRemoveUserFromTeam(props.teamMember.team_id);

    const isTeamAdmin = UserUtils.isAdmin(props.teamMember.roles) || props.teamMember.scheme_admin;
    const isSysAdmin = UserUtils.isSystemAdmin(props.user.roles);
    const isGuest = UserUtils.isGuest(props.user.roles);

    const {team} = props;
    let title;
    if (isSysAdmin) {
        title = Utils.localizeMessage('admin.user_item.sysAdmin', 'System Admin');
    } else if (isTeamAdmin) {
        title = Utils.localizeMessage('admin.user_item.teamAdmin', 'Team Admin');
    } else if (isGuest) {
        title = Utils.localizeMessage('admin.user_item.guest', 'Guest');
    } else {
        title = Utils.localizeMessage('admin.user_item.teamMember', 'Team Member');
    }

    return (
        <MenuWrapper>
            <a>
                <span>{title} </span>
                <span className='caret'/>
            </a>
            <Menu
                openLeft={true}
                ariaLabel={Utils.localizeMessage('team_members_dropdown.menuAriaLabel', 'Change the role of a team member')}
            >
                <Menu.ItemAction
                    show={!isTeamAdmin && !isGuest}
                    onClick={makeTeamAdmin}
                    text={Utils.localizeMessage('admin.user_item.makeTeamAdmin', 'Make Team Admin')}
                />
                <Menu.ItemAction
                    show={isTeamAdmin}
                    onClick={makeMember}
                    text={Utils.localizeMessage('admin.user_item.makeMember', 'Make Team Member')}
                />
                <Menu.ItemAction
                    show={!team.group_constrained}
                    onClick={removeFromTeam}
                    text={Utils.localizeMessage('team_members_dropdown.leave_team', 'Remove from Team')}
                />
            </Menu>
        </MenuWrapper>
    );
};

export default ManageTeamsDropdown;
