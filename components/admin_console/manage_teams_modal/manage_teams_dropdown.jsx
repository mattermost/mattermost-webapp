// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import * as Utils from 'utils/utils.jsx';

export default class ManageTeamsDropdown extends React.Component {
    static propTypes = {
        team: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        teamMember: PropTypes.object.isRequired,
        onError: PropTypes.func.isRequired,
        onMemberChange: PropTypes.func.isRequired,
        updateTeamMemberSchemeRoles: PropTypes.func.isRequired,
        handleRemoveUserFromTeam: PropTypes.func.isRequired,
    };

    makeTeamAdmin = async () => {
        const {error} = await this.props.updateTeamMemberSchemeRoles(this.props.teamMember.team_id, this.props.user.id, true, true);
        if (error) {
            this.props.onError(error.message);
        } else {
            this.props.onMemberChange(this.props.teamMember.team_id);
        }
    };

    makeMember = async () => {
        const {error} = await this.props.updateTeamMemberSchemeRoles(this.props.teamMember.team_id, this.props.user.id, true, false);
        if (error) {
            this.props.onError(error.message);
        } else {
            this.props.onMemberChange(this.props.teamMember.team_id);
        }
    };

    removeFromTeam = () => {
        this.props.handleRemoveUserFromTeam(this.props.teamMember.team_id);
    }

    render() {
        const isTeamAdmin = Utils.isAdmin(this.props.teamMember.roles) || this.props.teamMember.scheme_admin;
        const {team} = this.props;
        let title;
        if (isTeamAdmin) {
            title = Utils.localizeMessage('admin.user_item.teamAdmin', 'Team Admin');
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
                    ariaLabel={Utils.localizeMessage('team_members_dropdown.menuAriaLabel', 'Team member role change')}
                >
                    <Menu.ItemAction
                        show={!isTeamAdmin}
                        onClick={this.makeTeamAdmin}
                        text={Utils.localizeMessage('admin.user_item.makeTeamAdmin', 'Make Team Admin')}
                    />
                    <Menu.ItemAction
                        show={isTeamAdmin}
                        onClick={this.makeMember}
                        text={Utils.localizeMessage('admin.user_item.makeMember', 'Make Member')}
                    />
                    <Menu.ItemAction
                        show={!team.group_constrained}
                        onClick={this.removeFromTeam}
                        text={Utils.localizeMessage('team_members_dropdown.leave_team', 'Remove from Team')}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}
