// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import * as Utils from 'utils/utils.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

const ROWS_FROM_BOTTOM_TO_OPEN_UP = 3;

export default class TeamMembersDropdown extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,
        teamMember: PropTypes.object.isRequired,
        teamUrl: PropTypes.string.isRequired,
        currentTeam: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        totalUsers: PropTypes.number.isRequired,
        actions: PropTypes.shape({
            getMyTeamMembers: PropTypes.func.isRequired,
            getMyTeamUnreads: PropTypes.func.isRequired,
            getUser: PropTypes.func.isRequired,
            getTeamMember: PropTypes.func.isRequired,
            getTeamStats: PropTypes.func.isRequired,
            getChannelStats: PropTypes.func.isRequired,
            updateTeamMemberSchemeRoles: PropTypes.func.isRequired,
            removeUserFromTeamAndGetStats: PropTypes.func.isRequired,
            updateUserActive: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: null,
            showDemoteModal: false,
            user: null,
            role: null,
        };
    }

    handleMakeMember = async () => {
        const me = this.props.currentUser;
        if (this.props.user.id === me.id && me.roles.includes('system_admin')) {
            this.handleDemote(this.props.user, 'team_user');
        } else {
            const {error} = await this.props.actions.updateTeamMemberSchemeRoles(this.props.teamMember.team_id, this.props.user.id, true, false);
            if (error) {
                this.setState({serverError: error.message});
            } else {
                this.props.actions.getUser(this.props.user.id);
                this.props.actions.getTeamMember(this.props.teamMember.team_id, this.props.user.id);
                if (this.props.user.id === me.id) {
                    await this.props.actions.getMyTeamMembers();
                    this.props.actions.getMyTeamUnreads();
                }
            }
        }
    }

    handleRemoveFromTeam = async () => {
        const {error} = await this.props.actions.removeUserFromTeamAndGetStats(this.props.teamMember.team_id, this.props.user.id);
        if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleMakeAdmin = async () => {
        const me = this.props.currentUser;
        if (this.props.user.id === me.id && me.roles.includes('system_admin')) {
            this.handleDemote(this.props.user, 'team_user team_admin');
        } else {
            const {error} = await this.props.actions.updateTeamMemberSchemeRoles(this.props.teamMember.team_id, this.props.user.id, true, true);
            if (error) {
                this.setState({serverError: error.message});
            } else {
                this.props.actions.getUser(this.props.user.id);
                this.props.actions.getTeamMember(this.props.teamMember.team_id, this.props.user.id);
            }
        }
    }

    handleDemote = (user, role, newRole) => {
        this.setState({
            serverError: this.state.serverError,
            showDemoteModal: true,
            user,
            role,
            newRole,
        });
    }

    handleDemoteCancel = () => {
        this.setState({
            serverError: null,
            showDemoteModal: false,
            user: null,
            role: null,
            newRole: null,
        });
    }

    handleDemoteSubmit = async () => {
        const {error} = await this.props.actions.updateTeamMemberSchemeRoles(this.props.teamMember.team_id, this.props.user.id, true, false);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.props.actions.getUser(this.props.user.id);
            browserHistory.push(this.props.teamUrl);
        }
    }

    render() {
        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='has-error'>
                    <label className='has-error control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        const {currentTeam, teamMember, user} = this.props;

        let currentRoles = null;

        if (Utils.isGuest(user)) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.guest'
                    defaultMessage='Guest'
                />
            );
        } else if (user.roles.length > 0 && Utils.isSystemAdmin(user.roles)) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.systemAdmin'
                    defaultMessage='System Admin'
                />
            );
        } else if ((teamMember.roles.length > 0 && Utils.isAdmin(teamMember.roles)) || teamMember.scheme_admin) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.teamAdmin'
                    defaultMessage='Team Admin'
                />
            );
        } else {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.member'
                    defaultMessage='Member'
                />
            );
        }

        const me = this.props.currentUser;
        let showMakeMember = !Utils.isGuest(user) && (Utils.isAdmin(teamMember.roles) || teamMember.scheme_admin) && !Utils.isSystemAdmin(user.roles);
        let showMakeAdmin = !Utils.isGuest(user) && !Utils.isAdmin(teamMember.roles) && !Utils.isSystemAdmin(user.roles) && !teamMember.scheme_admin;

        if (user.delete_at > 0) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.inactive'
                    defaultMessage='Inactive'
                />
            );
            showMakeMember = false;
            showMakeAdmin = false;
        }

        const canRemoveFromTeam = user.id !== me.id && !currentTeam.group_constrained;

        let makeDemoteModal = null;
        if (user.id === me.id) {
            const title = (
                <FormattedMessage
                    id='team_members_dropdown.confirmDemoteRoleTitle'
                    defaultMessage='Confirm demotion from System Admin role'
                />
            );

            const message = (
                <div>
                    <FormattedMessage
                        id='team_members_dropdown.confirmDemoteDescription'
                        defaultMessage="If you demote yourself from the System Admin role and there is not another user with System Admin privileges, you'll need to re-assign a System Admin by accessing the Mattermost server through a terminal and running the following command."
                    />
                    <br/>
                    <br/>
                    <FormattedMessage
                        id='team_members_dropdown.confirmDemotionCmd'
                        defaultMessage='platform roles system_admin {username}'
                        vallues={{
                            username: me.username,
                        }}
                    />
                    {serverError}
                </div>
            );

            const confirmButton = (
                <FormattedMessage
                    id='team_members_dropdown.confirmDemotion'
                    defaultMessage='Confirm Demotion'
                />
            );

            makeDemoteModal = (
                <ConfirmModal
                    show={this.state.showDemoteModal}
                    title={title}
                    message={message}
                    confirmButtonText={confirmButton}
                    onConfirm={this.handleDemoteSubmit}
                    onCancel={this.handleDemoteCancel}
                />
            );
        }

        if (!canRemoveFromTeam && !showMakeAdmin && !showMakeMember) {
            return <div>{currentRoles}</div>;
        }

        const {index, totalUsers} = this.props;
        let openUp = false;
        if (totalUsers > ROWS_FROM_BOTTOM_TO_OPEN_UP && totalUsers - index <= ROWS_FROM_BOTTOM_TO_OPEN_UP) {
            openUp = true;
        }

        return (
            <MenuWrapper>
                <button
                    id={`teamMembersDropdown_${user.username}`}
                    className='dropdown-toggle theme color--link style--none'
                    type='button'
                    aria-expanded='true'
                >
                    <span>{currentRoles} </span>
                    <DropdownIcon/>
                </button>
                <div>
                    <Menu
                        openLeft={true}
                        openUp={openUp}
                        ariaLabel={Utils.localizeMessage('team_members_dropdown.menuAriaLabel', 'Team member role change')}
                    >
                        <Menu.ItemAction
                            id='removeFromTeam'
                            show={canRemoveFromTeam}
                            onClick={this.handleRemoveFromTeam}
                            text={Utils.localizeMessage('team_members_dropdown.leave_team', 'Remove From Team')}
                        />
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
                    {makeDemoteModal}
                    {serverError}
                </div>
            </MenuWrapper>
        );
    }
}
