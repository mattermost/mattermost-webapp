// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {updateActive} from 'actions/user_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import DropdownIcon from 'components/icon/dropdown_icon';

export default class TeamMembersDropdown extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,
        currentChannelId: PropTypes.string.isRequired,
        teamMember: PropTypes.object.isRequired,
        teamUrl: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getMyTeamMembers: PropTypes.func.isRequired,
            getMyTeamUnreads: PropTypes.func.isRequired,
            getUser: PropTypes.func.isRequired,
            getTeamStats: PropTypes.func.isRequired,
            getChannelStats: PropTypes.func.isRequired,
            updateTeamMemberSchemeRoles: PropTypes.func.isRequired,
            removeUserFromTeamAndGetStats: PropTypes.func.isRequired,
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

    handleMakeActive = () => {
        updateActive(this.props.user.id, true,
            () => {
                this.props.actions.getChannelStats(this.props.currentChannelId);
                this.props.actions.getTeamStats(this.props.teamMember.team_id);
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleMakeNotActive = () => {
        updateActive(this.props.user.id, false,
            () => {
                this.props.actions.getChannelStats(this.props.currentChannelId);
                this.props.actions.getTeamStats(this.props.teamMember.team_id);
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
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

        const teamMember = this.props.teamMember;
        const user = this.props.user;
        let currentRoles = (
            <FormattedMessage
                id='team_members_dropdown.member'
                defaultMessage='Member'
            />
        );

        if ((teamMember.roles.length > 0 && Utils.isAdmin(teamMember.roles)) || teamMember.scheme_admin) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.teamAdmin'
                    defaultMessage='Team Admin'
                />
            );
        }

        if (user.roles.length > 0 && Utils.isSystemAdmin(user.roles)) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.systemAdmin'
                    defaultMessage='System Admin'
                />
            );
        }

        const me = this.props.currentUser;
        let showMakeMember = (Utils.isAdmin(teamMember.roles) || teamMember.scheme_admin) && !Utils.isSystemAdmin(user.roles);
        let showMakeAdmin = !Utils.isAdmin(teamMember.roles) && !Utils.isSystemAdmin(user.roles) && !teamMember.scheme_admin;
        let showMakeActive = false;
        let showMakeNotActive = Utils.isSystemAdmin(user.roles);

        if (user.delete_at > 0) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.inactive'
                    defaultMessage='Inactive'
                />
            );
            showMakeMember = false;
            showMakeAdmin = false;
            showMakeActive = true;
            showMakeNotActive = false;
        }

        let makeAdmin = null;
        if (showMakeAdmin) {
            makeAdmin = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeAdmin}
                    >
                        <FormattedMessage
                            id='team_members_dropdown.makeAdmin'
                            defaultMessage='Make Team Admin'
                        />
                    </a>
                </li>
            );
        }

        let makeMember = null;
        if (showMakeMember) {
            makeMember = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeMember}
                    >
                        <FormattedMessage
                            id='team_members_dropdown.makeMember'
                            defaultMessage='Make Member'
                        />
                    </a>
                </li>
            );
        }

        let removeFromTeam = null;
        if (this.props.user.id !== me.id) {
            removeFromTeam = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleRemoveFromTeam}
                    >
                        <FormattedMessage
                            id='team_members_dropdown.leave_team'
                            defaultMessage='Remove From Team'
                        />
                    </a>
                </li>
            );
        }

        const makeActive = null;
        if (showMakeActive) {
            // makeActive = (
            //     <li role='presentation'>
            //         <a
            //             role='menuitem'
            //             href='#'
            //             onClick={this.handleMakeActive}
            //         >
            //             <FormattedMessage
            //                 id='team_members_dropdown.makeActive'
            //                 defaultMessage='Activate'
            //             />
            //         </a>
            //     </li>
            // );
        }

        const makeNotActive = null;
        if (showMakeNotActive) {
            // makeNotActive = (
            //     <li role='presentation'>
            //         <a
            //             role='menuitem'
            //             href='#'
            //             onClick={this.handleMakeNotActive}
            //         >
            //             <FormattedMessage
            //                 id='team_members_dropdown.makeInactive'
            //                 defaultMessage='Deactivate'
            //             />
            //         </a>
            //     </li>
            // );
        }

        let makeDemoteModal = null;
        if (this.props.user.id === me.id) {
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

        if (!removeFromTeam && !makeAdmin && !makeMember && !makeActive && !makeNotActive) {
            return <div>{currentRoles}</div>;
        }

        return (
            <div className='dropdown member-drop'>
                <button
                    className='dropdown-toggle theme color--link style--none'
                    type='button'
                    data-toggle='dropdown'
                    aria-expanded='true'
                >
                    <span>{currentRoles} </span>
                    <DropdownIcon/>
                </button>
                <ul
                    className='dropdown-menu member-menu'
                    role='menu'
                >
                    {removeFromTeam}
                    {makeAdmin}
                    {makeMember}
                    {makeActive}
                    {makeNotActive}
                </ul>
                {makeDemoteModal}
                {serverError}
            </div>
        );
    }
}
