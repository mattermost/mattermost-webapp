// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen';
import Avatar from 'components/widgets/users/avatar';

import ManageTeamsDropdown from './manage_teams_dropdown.jsx';
import RemoveFromTeamButton from './remove_from_team_button.jsx';

export default class ManageTeamsModal extends React.PureComponent {
    static propTypes = {
        locale: PropTypes.string.isRequired,
        onModalDismissed: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
        user: PropTypes.object,
        actions: PropTypes.shape({
            getTeamMembersForUser: PropTypes.func.isRequired,
            getTeamsForUser: PropTypes.func.isRequired,
            updateTeamMemberSchemeRoles: PropTypes.func.isRequired,
            removeUserFromTeam: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            teams: null,
            teamMembers: null,
        };
    }

    componentDidMount() {
        if (this.props.user) {
            this.loadTeamsAndTeamMembers();
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        const userId = this.props.user ? this.props.user.id : '';
        const nextUserId = nextProps.user ? nextProps.user.id : '';

        if (userId !== nextUserId) {
            this.setState({
                teams: null,
                teamMembers: null,
            });

            if (nextProps.user) {
                this.loadTeamsAndTeamMembers(nextProps.user);
            }
        }
    }

    loadTeamsAndTeamMembers = async (user = this.props.user) => {
        this.getTeamMembers(user.id);
        const {data} = await this.props.actions.getTeamsForUser(user.id);
        this.setState({
            teams: filterAndSortTeamsByDisplayName(data, this.props.locale),
        });
    }

    handleError = (error) => {
        this.setState({
            error,
        });
    }

    getTeamMembers = async (userId = this.props.user.id) => {
        const {data} = await this.props.actions.getTeamMembersForUser(userId);
        if (data) {
            this.setState({
                teamMembers: data,
            });
        }
    }

    handleMemberRemove = (teamId) => {
        this.setState({
            teams: this.state.teams.filter((team) => team.id !== teamId),
            teamMembers: this.state.teamMembers.filter((teamMember) => teamMember.team_id !== teamId),
        });
    }

    handleRemoveUserFromTeam = async (teamId) => {
        const {actions, user} = this.props;

        const {data, error} = await actions.removeUserFromTeam(teamId, user.id);
        if (data) {
            this.handleMemberRemove(teamId);
        } else if (error) {
            this.handleError(error.message);
        }
    }

    handleMemberChange = () => {
        this.getTeamMembers(this.props.user.id);
    };

    renderContents = () => {
        const {user} = this.props;
        const {teams, teamMembers} = this.state;

        if (!user) {
            return <LoadingScreen/>;
        }

        const isSystemAdmin = Utils.isAdmin(user.roles);

        let name = Utils.getFullName(user);
        if (name) {
            name += ` (@${user.username})`;
        } else {
            name = `@${user.username}`;
        }

        let teamList;
        if (teams && teamMembers) {
            teamList = teams.map((team) => {
                const teamMember = teamMembers.find((member) => member.team_id === team.id);
                if (!teamMember) {
                    return null;
                }

                let action;
                if (isSystemAdmin) {
                    action = (
                        <RemoveFromTeamButton
                            teamId={team.id}
                            handleRemoveUserFromTeam={this.handleRemoveUserFromTeam}
                        />
                    );
                } else {
                    action = (
                        <ManageTeamsDropdown
                            user={user}
                            team={team}
                            teamMember={teamMember}
                            onError={this.handleError}
                            onMemberChange={this.handleMemberChange}
                            updateTeamMemberSchemeRoles={this.props.actions.updateTeamMemberSchemeRoles}
                            handleRemoveUserFromTeam={this.handleRemoveUserFromTeam}
                        />
                    );
                }

                return (
                    <div
                        key={team.id}
                        className='manage-teams__team'
                    >
                        <div className='manage-teams__team-name'>
                            {team.display_name}
                        </div>
                        <div className='manage-teams__team-actions'>
                            {action}
                        </div>
                    </div>
                );
            });
        } else {
            teamList = <LoadingScreen/>;
        }

        let systemAdminIndicator = null;
        if (isSystemAdmin) {
            systemAdminIndicator = (
                <div className='manage-teams__system-admin'>
                    <FormattedMessage
                        id='admin.user_item.sysAdmin'
                        defaultMessage='System Admin'
                    />
                </div>
            );
        }

        return (
            <div>
                <div className='manage-teams__user'>
                    <Avatar
                        username={user.username}
                        url={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                        size='lg'
                    />
                    <div className='manage-teams__info'>
                        <div className='manage-teams__name'>
                            {name}
                        </div>
                        <div className='manage-teams__email'>
                            {user.email}
                        </div>
                    </div>
                    {systemAdminIndicator}
                </div>
                <div className='manage-teams__teams'>
                    {teamList}
                </div>
            </div>
        );
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onModalDismissed}
                dialogClassName='a11y__modal manage-teams modal--overflow-visible'
                role='dialog'
                aria-labelledby='manageTeamsModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='manageTeamsModalLabel'
                    >
                        <FormattedMessage
                            id='admin.user_item.manageTeams'
                            defaultMessage='Manage Teams'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderContents()}
                </Modal.Body>
            </Modal>
        );
    }
}
