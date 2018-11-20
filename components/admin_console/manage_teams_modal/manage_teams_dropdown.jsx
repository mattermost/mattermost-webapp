// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Dropdown, MenuItem} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

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

    constructor(props) {
        super(props);

        this.toggleDropdown = this.toggleDropdown.bind(this);

        this.handleMemberChange = this.handleMemberChange.bind(this);

        this.state = {
            show: false,
        };
    }

    toggleDropdown() {
        this.setState((prevState) => {
            return {show: !prevState.show};
        });
    }

    makeTeamAdmin = async () => {
        const {error} = await this.props.updateTeamMemberSchemeRoles(this.props.teamMember.team_id, this.props.user.id, true, true);
        if (error) {
            this.props.onError(error.message);
        } else {
            this.handleMemberChange();
        }
    };

    makeMember = async () => {
        const {error} = await this.props.updateTeamMemberSchemeRoles(this.props.teamMember.team_id, this.props.user.id, true, false);
        if (error) {
            this.props.onError(error.message);
        } else {
            this.handleMemberChange();
        }
    };

    removeFromTeam = () => {
        this.props.handleRemoveUserFromTeam(this.props.teamMember.team_id);
    }

    handleMemberChange() {
        this.props.onMemberChange(this.props.teamMember.team_id);
    }

    render() {
        const isTeamAdmin = Utils.isAdmin(this.props.teamMember.roles) || this.props.teamMember.scheme_admin;

        let title;
        if (isTeamAdmin) {
            title = Utils.localizeMessage('admin.user_item.teamAdmin', 'Team Admin');
        } else {
            title = Utils.localizeMessage('admin.user_item.teamMember', 'Team Member');
        }

        let makeTeamAdmin = null;
        if (!isTeamAdmin) {
            makeTeamAdmin = (
                <MenuItem
                    id='makeTeamAdmin'
                    onSelect={this.makeTeamAdmin}
                >
                    <FormattedMessage
                        id='admin.user_item.makeTeamAdmin'
                        defaultMessage='Make Team Admin'
                    />
                </MenuItem>
            );
        }

        let makeMember = null;
        if (isTeamAdmin) {
            makeMember = (
                <MenuItem
                    id='makeMember'
                    onSelect={this.makeMember}
                >
                    <FormattedMessage
                        id='admin.user_item.makeMember'
                        defaultMessage='Make Member'
                    />
                </MenuItem>
            );
        }

        return (
            <Dropdown
                id={`manage-teams-${this.props.user.id}-${this.props.teamMember.team_id}`}
                open={this.state.show}
                onToggle={this.toggleDropdown}
            >
                <Dropdown.Toggle useAnchor={true}>
                    {title}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {makeTeamAdmin}
                    {makeMember}
                    <MenuItem
                        id='removeFromTeam'
                        onSelect={this.removeFromTeam}
                    >
                        <FormattedMessage
                            id='team_members_dropdown.leave_team'
                            defaultMessage='Remove from Team'
                        />
                    </MenuItem>
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
