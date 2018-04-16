// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Permissions} from 'mattermost-redux/constants';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import {addUserToTeamFromInvite} from 'actions/team_actions.jsx';
import TeamStore from 'stores/team_store.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import UserStore from 'stores/user_store.jsx';

import logoImage from 'images/logo.png';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import SiteNameAndDescription from 'components/common/site_name_and_description';

import SelectTeamItem from './components/select_team_item.jsx';

export default class SelectTeam extends React.Component {
    static propTypes = {
        isLicensed: PropTypes.bool.isRequired,
        customDescriptionText: PropTypes.string,
        enableTeamCreation: PropTypes.bool.isRequired,
        siteName: PropTypes.string,
        actions: PropTypes.shape({
            loadRolesIfNeeded: PropTypes.func.isRequired,
            getTeams: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const state = this.getStateFromStores(false);
        state.loadingTeamId = '';
        state.error = null;
        this.state = state;
    }

    componentWillMount() {
        this.props.actions.loadRolesIfNeeded(['system_user', 'system_admin']);
    }

    componentDidMount() {
        TeamStore.addChangeListener(this.onTeamChange);
        this.props.actions.getTeams(0, 200);
    }

    componentWillUnmount() {
        TeamStore.removeChangeListener(this.onTeamChange);
    }

    onTeamChange = () => {
        this.setState(this.getStateFromStores(true));
    };

    getStateFromStores(loaded) {
        return {
            teams: TeamStore.getAll(),
            teamMembers: TeamStore.getMyTeamMembers(),
            teamListings: TeamStore.getTeamListings(),
            loaded,
        };
    }

    handleTeamClick = (team) => {
        this.setState({loadingTeamId: team.id});

        addUserToTeamFromInvite('', '', team.invite_id,
            () => {
                this.props.history.push(`/${team.name}/channels/town-square`);
            },
            (error) => {
                this.setState({
                    error,
                    loadingTeamId: '',
                });
            }
        );
    };

    handleLogoutClick = (e) => {
        e.preventDefault();
        emitUserLoggedOutEvent('/login');
    }

    clearError = (e) => {
        e.preventDefault();

        this.setState({
            error: null,
        });
    };

    teamContentsCompare(teamItemA, teamItemB) {
        return teamItemA.props.team.display_name.localeCompare(teamItemB.props.team.display_name);
    }

    render() {
        const {
            customDescriptionText,
            enableTeamCreation,
            isLicensed,
            siteName,
        } = this.props;

        const isSystemAdmin = Utils.isSystemAdmin(UserStore.getCurrentUser().roles);

        let openContent;

        if (!this.state.loaded || this.state.loadingTeamId) {
            openContent = <LoadingScreen/>;
        } else if (this.state.error) {
            openContent = (
                <div className='signup__content'>
                    <div className={'form-group has-error'}>
                        <label className='control-label'>{this.state.error.message}</label>
                    </div>
                </div>
            );
        } else {
            let openTeamContents = [];
            const isAlreadyMember = new Map();

            for (const teamMember of this.state.teamMembers) {
                const teamId = teamMember.team_id;
                isAlreadyMember[teamId] = true;
            }

            for (const id in this.state.teamListings) {
                if (this.state.teamListings.hasOwnProperty(id) && !isAlreadyMember[id]) {
                    const openTeam = this.state.teamListings[id];
                    if (openTeam && openTeam.delete_at === 0) {
                        openTeamContents.push(
                            <SelectTeamItem
                                key={'team_' + openTeam.name}
                                team={openTeam}
                                onTeamClick={this.handleTeamClick}
                                loading={this.state.loadingTeamId === openTeam.id}
                            />
                        );
                    }
                }
            }

            if (openTeamContents.length === 0 && (enableTeamCreation || isSystemAdmin)) {
                openTeamContents = (
                    <div className='signup-team-dir-err'>
                        <div>
                            <FormattedMessage
                                id='signup_team.no_open_teams_canCreate'
                                defaultMessage='No teams are available to join. Please create a new team or ask your administrator for an invite.'
                            />
                        </div>
                    </div>
                );
            } else if (openTeamContents.length === 0) {
                openTeamContents = (
                    <div className='signup-team-dir-err'>
                        <div>
                            <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                                <FormattedMessage
                                    id='signup_team.no_open_teams_canCreate'
                                    defaultMessage='No teams are available to join. Please create a new team or ask your administrator for an invite.'
                                />
                            </SystemPermissionGate>
                            <SystemPermissionGate
                                permissions={[Permissions.CREATE_TEAM]}
                                invert={true}
                            >
                                <FormattedMessage
                                    id='signup_team.no_open_teams'
                                    defaultMessage='No teams are available to join. Please ask your administrator for an invite.'
                                />
                            </SystemPermissionGate>
                        </div>
                    </div>
                );
            }

            if (Array.isArray(openTeamContents)) {
                openTeamContents = openTeamContents.sort(this.teamContentsCompare);
            }

            openContent = (
                <div className='signup__content'>
                    <h4>
                        <FormattedMessage
                            id='signup_team.join_open'
                            defaultMessage='Teams you can join: '
                        />
                    </h4>
                    <div className='signup-team-all'>
                        {openTeamContents}
                    </div>
                </div>
            );
        }

        const teamSignUp = (
            <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                <div className='margin--extra'>
                    <Link
                        to='/create_team'
                        className='signup-team-login'
                    >
                        <FormattedMessage
                            id='login.createTeam'
                            defaultMessage='Create a new team'
                        />
                    </Link>
                </div>
            </SystemPermissionGate>
        );

        let adminConsoleLink;
        if (!UserAgent.isMobileApp()) {
            adminConsoleLink = (
                <SystemPermissionGate permissions={[Permissions.MANAGE_SYSTEM]}>
                    <div className='margin--extra hidden-xs'>
                        <Link
                            to='/admin_console'
                            className='signup-team-login'
                        >
                            <FormattedMessage
                                id='signup_team_system_console'
                                defaultMessage='Go to System Console'
                            />
                        </Link>
                    </div>
                </SystemPermissionGate>
            );
        }

        let headerButton;
        if (this.state.error) {
            headerButton = <BackButton onClick={this.clearError}/>;
        } else if (this.state.teamMembers.length) {
            headerButton = <BackButton/>;
        } else {
            headerButton = (
                <div className='signup-header'>
                    <a
                        href='#'
                        onClick={this.handleLogoutClick}
                    >
                        <span className='fa fa-chevron-left'/>
                        <FormattedMessage id='web.header.logout'/>
                    </a>
                </div>
            );
        }
        return (
            <div>
                <AnnouncementBar/>
                {headerButton}
                <div className='col-sm-12'>
                    <div className={'signup-team__container'}>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <SiteNameAndDescription
                            customDescriptionText={customDescriptionText}
                            isLicensed={isLicensed}
                            siteName={siteName}
                        />
                        {openContent}
                        {teamSignUp}
                        {adminConsoleLink}
                    </div>
                </div>
            </div>
        );
    }
}
