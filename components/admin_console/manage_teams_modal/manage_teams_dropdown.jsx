// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
<<<<<<< HEAD
import ReactDOM from 'react-dom';
import {Dropdown, MenuItem} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
=======

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import MenuItemAction from 'components/widgets/menu/menu_items/menu_item_action';
>>>>>>> MM-13265: Creating new set of widgets to build dropdown menus

import * as Utils from 'utils/utils.jsx';

export default class ManageTeamsDropdown extends React.Component {
    static propTypes = {
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

        let title;
        if (isTeamAdmin) {
            title = Utils.localizeMessage('admin.user_item.teamAdmin', 'Team Admin');
        } else {
            title = Utils.localizeMessage('admin.user_item.teamMember', 'Team Member');
        }

        return (
            <MenuWrapper>
                <span>{title}</span>
                <Menu openLeft={true}>
                    <MenuItemAction
                        show={!isTeamAdmin}
                        onClick={this.makeTeamAdmin}
                        text={Utils.localizeMessage('admin.user_item.makeTeamAdmin', 'Make Team Admin')}
                    />
                    <MenuItemAction
                        show={isTeamAdmin}
                        onClick={this.makeMember}
                        text={Utils.localizeMessage('admin.user_item.makeMember', 'Make Member')}
                    />
                    <MenuItemAction
                        onClick={this.removeFromTeam}
                        text={Utils.localizeMessage('team_members_dropdown.leave_team', 'Remove from Team')}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}
