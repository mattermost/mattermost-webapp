// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {filterAndSortTeamsByDisplayName} from 'utils/team_utils.jsx';
import {t} from 'utils/i18n';

import AbstractList from './abstract_list.jsx';
import TeamRow from './team_row.jsx';

const headerLabels = [
    {
        id: t('admin.systemUserDetail.teamList.header.name'),
        default: 'Name',
        style: {
            flexGrow: 1,
            minWidth: '284px',
            marginLeft: '16px',
        },
    },
    {
        id: t('admin.systemUserDetail.teamList.header.type'),
        default: 'Type',
        style: {
            width: '150px',
        },
    },
    {
        id: t('admin.systemUserDetail.teamList.header.role'),
        default: 'Role',
        style: {
            width: '150px',
        },
    },
    {
        style: {
            width: '150px',
        },
    },
];

export default class TeamList extends React.Component {
    static propTypes = {
        userId: PropTypes.string.isRequired,
        locale: PropTypes.string.isRequired,
        emptyListTextId: PropTypes.string.isRequired,
        emptyListTextDefaultMessage: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getTeamsData: PropTypes.func.isRequired,
            getTeamMembersForUser: PropTypes.func.isRequired,
            removeUserFromTeam: PropTypes.func.isRequired,
            updateTeamMemberSchemeRoles: PropTypes.func.isRequired,
        }).isRequired,
        userDetailCallback: PropTypes.func.isRequired,
        refreshTeams: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        emptyListTextId: t('admin.team_settings.team_list.no_teams_found'),
        emptyListTextDefaultMessage: 'No teams found',
        refreshTeams: false,
    }

    constructor(props) {
        super(props);
        this.state = {
            teamsWithMemberships: [],
            serverError: null,
        };
    }

    componentDidMount() {
        this.getTeamsAndMemberships();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.refreshTeams !== this.props.refreshTeams) {
            this.getTeamsAndMemberships();
        }
    }

    getTeamsAndMemberships = async (userId = this.props.userId) => {
        const teams = await this.props.actions.getTeamsData(userId);
        const memberships = await this.props.actions.getTeamMembersForUser(userId);
        return Promise.all([teams, memberships]).
            then(this.mergeTeamsWithMemberships).
            then((teamsWithMemberships) => {
                this.setState({teamsWithMemberships});
                this.props.userDetailCallback(teamsWithMemberships);
            });
    }

    mergeTeamsWithMemberships = (data) => {
        const teams = data[0].data;
        const memberships = data[1].data;
        let teamsWithMemberships = teams.map((object) => {
            const results = memberships.filter((team) => team.team_id === object.id);
            const team = {...object, ...results[0]};
            return team;
        });
        teamsWithMemberships = filterAndSortTeamsByDisplayName(teamsWithMemberships, this.props.locale);
        return teamsWithMemberships;
    }

    doRemoveUserFromTeam = async (teamId) => {
        const {error} = await this.props.actions.removeUserFromTeam(teamId, this.props.userId);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.getTeamsAndMemberships();
        }
    }

    doMakeUserTeamAdmin = async (teamId) => {
        const {error} = await this.props.actions.updateTeamMemberSchemeRoles(teamId, this.props.userId, true, true);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.getTeamsAndMemberships();
        }
    }

    doMakeUserTeamMember = async (teamId) => {
        const {error} = await this.props.actions.updateTeamMemberSchemeRoles(teamId, this.props.userId, true, false);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.getTeamsAndMemberships();
        }
    }

    render() {
        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='SystemUserDetail__error has-error'>
                    <label className='has-error control-label'>{this.state.serverError}</label>
                </div>
            );
        }
        return (
            <React.Fragment>
                <div>{serverError}</div>
                <AbstractList
                    headerLabels={headerLabels}
                    renderRow={this.renderRow}
                    total={this.state.teamsWithMemberships.length}
                    data={this.state.teamsWithMemberships}
                    actions={this.props.actions}
                    emptyListTextId={this.props.emptyListTextId}
                    emptyListTextDefaultMessage={this.props.emptyListTextDefaultMessage}
                    userId={this.props.userId}
                />
            </React.Fragment>
        );
    }

    renderRow = (item) => {
        return (
            <TeamRow
                key={item.id}
                team={item}
                doRemoveUserFromTeam={this.doRemoveUserFromTeam}
                doMakeUserTeamAdmin={this.doMakeUserTeamAdmin}
                doMakeUserTeamMember={this.doMakeUserTeamMember}
            />
        );
    }
}