// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Permissions} from 'mattermost-redux/constants';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import {trackEvent} from 'actions/diagnostics_actions.jsx';

import * as UserAgent from 'utils/user_agent';
import Constants from 'utils/constants';

import logoImage from 'images/logo.png';

import AnnouncementBar from 'components/announcement_bar';

import BackButton from 'components/common/back_button';
import LoadingScreen from 'components/loading_screen';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import LogoutIcon from 'components/widgets/icons/fa_logout_icon';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import InfiniteScroll from '../common/infinite_scroll.jsx';

import SelectTeamItem from './components/select_team_item.jsx';

export const TEAMS_PER_PAGE = 30;
const TEAM_MEMBERSHIP_DENIAL_ERROR_ID = 'api.team.add_members.user_denied';

export default class SelectTeam extends React.Component {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        currentUserRoles: PropTypes.string,
        currentUserIsGuest: PropTypes.bool,
        customDescriptionText: PropTypes.string,
        isMemberOfTeam: PropTypes.bool.isRequired,
        listableTeams: PropTypes.array,
        siteName: PropTypes.string,
        canCreateTeams: PropTypes.bool.isRequired,
        canManageSystem: PropTypes.bool.isRequired,
        canJoinPublicTeams: PropTypes.bool.isRequired,
        canJoinPrivateTeams: PropTypes.bool.isRequired,
        history: PropTypes.object,
        siteURL: PropTypes.string,
        actions: PropTypes.shape({
            getTeams: PropTypes.func.isRequired,
            loadRolesIfNeeded: PropTypes.func.isRequired,
            addUserToTeam: PropTypes.func.isRequired,
        }).isRequired,
        totalTeamsCount: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            loadingTeamId: '',
            error: null,
            endofTeamsData: false,
            currentPage: 0,
            currentListableTeams: [],
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.listableTeams.length !== state.currentListableTeams.length) {
            return {
                currentListableTeams: props.listableTeams.slice(0, TEAMS_PER_PAGE * state.currentPage),
            };
        }
        return null;
    }

    componentDidMount() {
        trackEvent('signup', 'signup_select_team', {userId: this.props.currentUserId});
        this.fetchMoreTeams();
        this.props.actions.loadRolesIfNeeded(this.props.currentUserRoles.split(' '));
    }

    fetchMoreTeams = async () => {
        const {currentPage} = this.state;
        const {actions} = this.props;

        const response = await actions.getTeams(currentPage, TEAMS_PER_PAGE, true);

        // We don't want to increase the page number if no data came back previously
        if (!response.error && !(response.error instanceof Error)) {
            this.setState((prevState) => (
                {
                    currentPage: prevState.currentPage + 1,
                }
            ),
            );
        }
    }

    handleTeamClick = async (team) => {
        const {siteURL, currentUserRoles} = this.props;
        this.setState({loadingTeamId: team.id});

        const {data, error} = await this.props.actions.addUserToTeam(team.id, this.props.currentUserId);
        if (data) {
            this.props.history.push(`/${team.name}/channels/${Constants.DEFAULT_CHANNEL}`);
        } else if (error) {
            let errorMsg = error.message;

            if (error.server_error_id === TEAM_MEMBERSHIP_DENIAL_ERROR_ID) {
                if (currentUserRoles.includes(Constants.PERMISSIONS_SYSTEM_ADMIN)) {
                    errorMsg = (
                        <FormattedMarkdownMessage
                            id='join_team_group_constrained_denied_admin'
                            defaultMessage={`You need to be a member of a linked group to join this team. You can add a group to this team [here](${siteURL}/admin_console/user_management/groups).`}
                            values={{siteURL}}
                        />
                    );
                } else {
                    errorMsg = (
                        <FormattedMarkdownMessage
                            id='join_team_group_constrained_denied'
                            defaultMessage='You need to be a member of a linked group to join this team.'
                        />
                    );
                }
            }

            this.setState({
                error: errorMsg,
                loadingTeamId: '',
            });
        }
    };

    handleLogoutClick = (e) => {
        e.preventDefault();
        trackEvent('select_team', 'click_logout');
        emitUserLoggedOutEvent('/login');
    };

    clearError = (e) => {
        e.preventDefault();

        this.setState({
            error: null,
        });
    };

    render() {
        const {currentPage, currentListableTeams} = this.state;
        const {
            currentUserIsGuest,
            canManageSystem,
            customDescriptionText,
            isMemberOfTeam,
            siteName,
            canCreateTeams,
            canJoinPublicTeams,
            canJoinPrivateTeams,
            totalTeamsCount,
        } = this.props;

        let openContent;
        if (this.state.loadingTeamId) {
            openContent = <LoadingScreen/>;
        } else if (this.state.error) {
            openContent = (
                <div className='signup__content'>
                    <div className={'form-group has-error'}>
                        <label className='control-label'>{this.state.error}</label>
                    </div>
                </div>
            );
        } else if (currentUserIsGuest) {
            openContent = (
                <div className='signup__content'>
                    <div className={'form-group has-error'}>
                        <label className='control-label'>
                            <FormattedMessage
                                id='signup_team.guest_without_channels'
                                defaultMessage='Your guest account has no channels assigned. Please contact an administrator.'
                            />
                        </label>
                    </div>
                </div>
            );
        } else {
            let joinableTeamContents = [];
            currentListableTeams.forEach((listableTeam) => {
                if ((listableTeam.allow_open_invite && canJoinPublicTeams) || (!listableTeam.allow_open_invite && canJoinPrivateTeams)) {
                    joinableTeamContents.push(
                        <SelectTeamItem
                            key={'team_' + listableTeam.name}
                            team={listableTeam}
                            onTeamClick={this.handleTeamClick}
                            loading={this.state.loadingTeamId === listableTeam.id}
                            canJoinPublicTeams={canJoinPublicTeams}
                            canJoinPrivateTeams={canJoinPrivateTeams}
                        />,
                    );
                }
            });

            if (joinableTeamContents.length === 0 && (canCreateTeams || canManageSystem)) {
                joinableTeamContents = (
                    <div className='signup-team-dir-err'>
                        <div>
                            <FormattedMessage
                                id='signup_team.no_open_teams_canCreate'
                                defaultMessage='No teams are available to join. Please create a new team or ask your administrator for an invite.'
                            />
                        </div>
                    </div>
                );
            } else if (joinableTeamContents.length === 0) {
                joinableTeamContents = (
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

            openContent = (
                <div
                    id='teamsYouCanJoinContent'
                    className='signup__content'
                >
                    <h4>
                        <FormattedMessage
                            id='signup_team.join_open'
                            defaultMessage='Teams you can join: '
                        />
                    </h4>
                    <InfiniteScroll
                        callBack={this.fetchMoreTeams}
                        styleClass='signup-team-all'
                        totalItems={totalTeamsCount}
                        itemsPerPage={TEAMS_PER_PAGE}
                        bufferValue={280}
                        pageNumber={currentPage}
                        loaderStyle={{padding: '0px', height: '40px'}}
                    >
                        {joinableTeamContents}
                    </InfiniteScroll>
                </div>
            );
        }

        const teamSignUp = (
            <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                <div
                    className='margin--extra'
                    style={{marginTop: '0.5em'}}
                >
                    <Link
                        id='createNewTeamLink'
                        to='/create_team'
                        onClick={() => trackEvent('select_team', 'click_create_team')}
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
                    <div className='mt-8 hidden-xs'>
                        <Link
                            to='/admin_console'
                            className='signup-team-login'
                            onClick={() => trackEvent('select_team', 'click_system_console')}
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
        } else if (isMemberOfTeam) {
            headerButton = <BackButton/>;
        } else {
            headerButton = (
                <div className='signup-header'>
                    <a
                        href='#'
                        id='logout'
                        onClick={this.handleLogoutClick}
                    >
                        <LogoutIcon/>
                        <FormattedMessage
                            id='web.header.logout'
                            defaultMessage='Logout'
                        />
                    </a>
                </div>
            );
        }
        return (
            <div>
                <AnnouncementBar/>
                {headerButton}
                <div className='col-sm-12'>
                    <div
                        className={'signup-team__container'}
                    >
                        <img
                            alt={'signup team logo'}
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <SiteNameAndDescription
                            customDescriptionText={customDescriptionText}
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
