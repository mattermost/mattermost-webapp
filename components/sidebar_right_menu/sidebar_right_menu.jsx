// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {Permissions} from 'mattermost-redux/constants';
import classNames from 'classnames';

import * as GlobalActions from 'actions/global_actions.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import {
    Constants,
    WebrtcActionTypes,
} from 'utils/constants.jsx';
import {useSafeUrl} from 'utils/url.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import AboutBuildModal from 'components/about_build_modal';
import AddUsersToTeam from 'components/add_users_to_team';
import LeaveTeamIcon from 'components/svg/leave_team_icon';
import TeamMembersModal from 'components/team_members_modal';
import ToggleModalButton from 'components/toggle_modal_button.jsx';
import TeamSettingsModal from 'components/team_settings_modal.jsx';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import MenuTutorialTip from 'components/tutorial/menu_tutorial_tip';

export default class SidebarRightMenu extends React.Component {

    static propTypes = {
        teamId: PropTypes.string,
        isOpen: PropTypes.bool.isRequired,
        teamType: PropTypes.string,
        teamDisplayName: PropTypes.string,
        isMentionSearch: PropTypes.bool,
        showTutorialTip: PropTypes.bool.isRequired,
        appDownloadLink: PropTypes.string,
        enableUserCreation: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        helpLink: PropTypes.string,
        reportAProblemLink: PropTypes.string,
        siteName: PropTypes.string,
        pluginMenuItems: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.shape({
            showMentions: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func.isRequired,
            openRhsMenu: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
        }),
    };

    static defaultProps = {
        pluginMenuItems: [],
    }

    constructor(props) {
        super(props);

        this.state = {
            ...this.getStateFromStores(),
            showAboutModal: false,
            showAddUsersToTeamModal: false,
            showTeamSettingsModal: false,
        };
    }

    componentDidMount() {
        TeamStore.addChangeListener(this.onChange);
        PreferenceStore.addChangeListener(this.onChange);
    }

    componentWillUnmount() {
        TeamStore.removeChangeListener(this.onChange);
        PreferenceStore.removeChangeListener(this.onChange);
    }

    handleClick = (e) => {
        if (WebrtcStore.isBusy()) {
            WebrtcStore.emitChanged({action: WebrtcActionTypes.IN_PROGRESS});
            e.preventDefault();
        }
    }

    handleAboutModal = () => {
        this.setState({showAboutModal: true});
    }

    aboutModalDismissed = () => {
        this.setState({showAboutModal: false});
    }

    showAddUsersToTeamModal = (e) => {
        e.preventDefault();

        this.setState({
            showAddUsersToTeamModal: true,
            showDropdown: false,
        });
    }

    hideAddUsersToTeamModal = () => {
        this.setState({
            showAddUsersToTeamModal: false,
        });
    }

    showTeamSettingsModal = (e) => {
        e.preventDefault();

        this.setState({
            showTeamSettingsModal: true,
            showDropdown: false,
        });
    }

    hideTeamSettingsModal = () => {
        this.setState({showTeamSettingsModal: false});
    }

    getFlagged = (e) => {
        e.preventDefault();
        this.props.actions.showFlaggedPosts();
        this.props.actions.closeRhsMenu();
    }

    getStateFromStores = () => {
        return {
            currentUser: UserStore.getCurrentUser(),
            teamMembers: TeamStore.getMyTeamMembers(),
            teamListings: TeamStore.getTeamListings(),
        };
    }

    onChange = () => {
        this.setState(this.getStateFromStores());
    }

    searchMentions = (e) => {
        e.preventDefault();

        if (this.props.isMentionSearch) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.closeRhsMenu();
            this.props.actions.showMentions();
        }
    }

    showAccountSettingsModal = () => {
        GlobalActions.showAccountSettingsModal();
    }

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    render() {
        const currentUser = UserStore.getCurrentUser();
        let teamLink;
        let inviteLink;
        let addUserToTeamLink;
        let manageLink;
        let consoleLink;
        let joinAnotherTeamLink;
        let createTeam = null;

        if (currentUser != null) {
            inviteLink = (
                <TeamPermissionGate
                    teamId={this.props.teamId}
                    permissions={[Permissions.INVITE_USER]}
                >
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_USER_TO_TEAM]}
                    >
                        <li>
                            <a
                                href='#'
                                onClick={GlobalActions.showInviteMemberModal}
                            >
                                <i className='icon fa fa-user-plus'/>
                                <FormattedMessage
                                    id='sidebar_right_menu.inviteNew'
                                    defaultMessage='Send Email Invite'
                                />
                            </a>
                        </li>
                    </TeamPermissionGate>
                </TeamPermissionGate>
            );

            addUserToTeamLink = (
                <TeamPermissionGate
                    teamId={this.props.teamId}
                    permissions={[Permissions.ADD_USER_TO_TEAM]}
                >
                    <li>
                        <a
                            id='addUsersToTeam'
                            href='#'
                            onClick={this.showAddUsersToTeamModal}
                        >
                            <i className='icon fa fa-user-plus'/>
                            <FormattedMessage
                                id='sidebar_right_menu.addMemberToTeam'
                                defaultMessage='Add Members to Team'
                            />
                        </a>
                    </li>
                </TeamPermissionGate>
            );

            if (this.props.teamType === Constants.OPEN_TEAM && this.props.enableUserCreation) {
                teamLink = (
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.INVITE_USER]}
                    >
                        <TeamPermissionGate
                            teamId={this.props.teamId}
                            permissions={[Permissions.ADD_USER_TO_TEAM]}
                        >
                            <li>
                                <a
                                    href='#'
                                    onClick={GlobalActions.showGetTeamInviteLinkModal}
                                >
                                    <i className='icon fa fa-link'/>
                                    <FormattedMessage
                                        id='sidebar_right_menu.teamLink'
                                        defaultMessage='Get Team Invite Link'
                                    />
                                </a>
                            </li>
                        </TeamPermissionGate>
                    </TeamPermissionGate>
                );
            }

            let moreTeams = false;
            const isAlreadyMember = this.state.teamMembers.reduce((result, item) => {
                result[item.team_id] = true;
                return result;
            }, {});

            for (const id in this.state.teamListings) {
                if (this.state.teamListings.hasOwnProperty(id) && !isAlreadyMember[id]) {
                    moreTeams = true;
                    break;
                }
            }

            if (moreTeams && !this.props.experimentalPrimaryTeam) {
                joinAnotherTeamLink = (
                    <li key='joinTeam_li'>
                        <Link to='/select_team'>
                            <i className='icon fa fa-plus-square'/>
                            <FormattedMessage
                                id='navbar_dropdown.join'
                                defaultMessage='Join Another Team'
                            />
                        </Link>
                    </li>
                );
            }

            createTeam = (
                <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                    <li key='newTeam_li'>
                        <Link
                            id='createTeam'
                            key='newTeam_a'
                            to='/create_team'
                            onClick={this.handleClick}
                        >
                            <i className='icon fa fa-plus-square'/>
                            <FormattedMessage
                                id='navbar_dropdown.create'
                                defaultMessage='Create a New Team'
                            />
                        </Link>
                    </li>
                </SystemPermissionGate>
            );
        }

        manageLink = (
            <li>
                <ToggleModalButton dialogType={TeamMembersModal}>
                    <i className='icon fa fa-users'/>
                    <FormattedMessage
                        id='sidebar_right_menu.viewMembers'
                        defaultMessage='View Members'
                    />
                </ToggleModalButton>
            </li>
        );

        const pluginItems = this.props.pluginMenuItems.map((item) => {
            const MenuIcon = item.mobile_icon;
            return (
                <li key={item.id + '_pluginrightmenuitem'}>
                    <a
                        id={item.id + '_pluginrightmenuitem'}
                        href='#'
                        onClick={item.action}
                    >
                        {MenuIcon ? <MenuIcon/> : <i className='icon fa fa-plus-square'/>}
                        {item.text}
                    </a>
                </li>
            );
        });

        let pluginDivider = null;
        if (pluginItems.length > 0) {
            pluginDivider = <li className='divider'/>;
        }

        let leaveTeam = '';
        if (!this.props.experimentalPrimaryTeam) {
            leaveTeam = (
                <li key='leaveTeam_li'>
                    <a
                        id='leaveTeam'
                        href='#'
                        onClick={GlobalActions.showLeaveTeamModal}
                    >
                        <LeaveTeamIcon className='icon'/>
                        <FormattedMessage
                            id='navbar_dropdown.leave'
                            defaultMessage='Leave Team'
                        />
                    </a>
                </li>
            );
        }

        const teamSettingsLink = (
            <TeamPermissionGate
                teamId={this.props.teamId}
                permissions={[Permissions.MANAGE_TEAM]}
            >
                <li>
                    <a
                        href='#'
                        onClick={this.showTeamSettingsModal}
                    >
                        <i className='icon fa fa-globe'/>
                        <FormattedMessage
                            id='sidebar_right_menu.teamSettings'
                            defaultMessage='Team Settings'
                        />
                    </a>
                </li>
            </TeamPermissionGate>
        );
        manageLink = (
            <TeamPermissionGate
                teamId={this.props.teamId}
                permissions={[Permissions.MANAGE_TEAM]}
            >
                <li>
                    <ToggleModalButton
                        dialogType={TeamMembersModal}
                    >
                        <i className='icon fa fa-users'/>
                        <FormattedMessage
                            id='sidebar_right_menu.manageMembers'
                            defaultMessage='Manage Members'
                        />
                    </ToggleModalButton>
                </li>
            </TeamPermissionGate>
        );

        if (!Utils.isMobile()) {
            consoleLink = (
                <SystemPermissionGate permissions={[Permissions.MANAGE_SYSTEM]}>
                    <li>
                        <Link
                            to={'/admin_console'}
                            onClick={this.handleClick}
                        >
                            <i className='icon fa fa-wrench'/>
                            <FormattedMessage
                                id='sidebar_right_menu.console'
                                defaultMessage='System Console'
                            />
                        </Link>
                    </li>
                </SystemPermissionGate>
            );
        }

        var siteName = '';
        if (this.props.siteName != null) {
            siteName = this.props.siteName;
        }
        var teamDisplayName = siteName;
        if (this.props.teamDisplayName) {
            teamDisplayName = this.props.teamDisplayName;
        }

        let helpLink = null;
        if (this.props.helpLink) {
            helpLink = (
                <li>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        to={this.props.helpLink}
                    >
                        <i className='icon fa fa-question'/>
                        <FormattedMessage
                            id='sidebar_right_menu.help'
                            defaultMessage='Help'
                        />
                    </Link>
                </li>
            );
        }

        let reportLink = null;
        if (this.props.reportAProblemLink) {
            reportLink = (
                <li>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        to={this.props.reportAProblemLink}
                    >
                        <i className='icon fa fa-phone'/>
                        <FormattedMessage
                            id='sidebar_right_menu.report'
                            defaultMessage='Report a Problem'
                        />
                    </Link>
                </li>
            );
        }

        let tutorialTip = null;
        if (this.props.showTutorialTip) {
            tutorialTip = <MenuTutorialTip onBottom={true}/>;
            this.props.actions.openRhsMenu();
        }

        let nativeAppLink = null;
        if (this.props.appDownloadLink && !UserAgent.isMobileApp()) {
            nativeAppLink = (
                <li>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        to={useSafeUrl(this.props.appDownloadLink)}
                    >
                        <i className='icon fa fa-mobile'/>
                        <FormattedMessage
                            id='sidebar_right_menu.nativeApps'
                            defaultMessage='Download Apps'
                        />
                    </Link>
                </li>
            );
        }

        let addUsersToTeamModal;
        if (this.state.showAddUsersToTeamModal) {
            addUsersToTeamModal = (
                <AddUsersToTeam
                    onModalDismissed={this.hideAddUsersToTeamModal}
                />
            );
        }

        let teamDivider = null;
        if (teamSettingsLink || manageLink || joinAnotherTeamLink || createTeam || leaveTeam) {
            teamDivider = <li className='divider'/>;
        }

        let consoleDivider = null;
        if (consoleLink) {
            consoleDivider = <li className='divider'/>;
        }

        return (
            <div
                className={classNames('sidebar--menu', {'move--left': this.props.isOpen && Utils.isMobile()})}
                id='sidebar-menu'
            >
                <div className='team__header theme'>
                    <Link
                        className='team__name'
                        to={`/channels/${Constants.DEFAULT_CHANNEL}`}
                    >
                        {teamDisplayName}
                    </Link>
                </div>

                <div className='nav-pills__container'>
                    {tutorialTip}
                    <ul className='nav nav-pills nav-stacked'>
                        <li>
                            <a
                                href='#'
                                onClick={this.searchMentions}
                            >
                                <i className='icon mentions'>{'@'}</i>
                                <FormattedMessage
                                    id='sidebar_right_menu.recentMentions'
                                    defaultMessage='Recent Mentions'
                                />
                            </a>
                        </li>
                        <li>
                            <a
                                href='#'
                                onClick={this.getFlagged}
                            >
                                <i className='icon fa fa-flag'/>
                                <FormattedMessage
                                    id='sidebar_right_menu.flagged'
                                    defaultMessage='Flagged Posts'
                                />
                            </a>
                        </li>
                        <li className='divider'/>
                        <li>
                            <a
                                href='#'
                                onClick={this.showAccountSettingsModal}
                            >
                                <i className='icon fa fa-cog'/>
                                <FormattedMessage
                                    id='sidebar_right_menu.accountSettings'
                                    defaultMessage='Account Settings'
                                />
                            </a>
                        </li>
                        <li className='divider'/>
                        {inviteLink}
                        {teamLink}
                        {addUserToTeamLink}
                        {teamDivider}
                        {teamSettingsLink}
                        {manageLink}
                        {createTeam}
                        {joinAnotherTeamLink}
                        {leaveTeam}
                        {pluginDivider}
                        {pluginItems}
                        {consoleDivider}
                        {consoleLink}
                        <li className='divider'/>
                        {helpLink}
                        {reportLink}
                        {nativeAppLink}
                        <li>
                            <a
                                href='#'
                                onClick={this.handleAboutModal}
                            >
                                <i className='icon fa fa-info'/>
                                <FormattedMessage
                                    id='navbar_dropdown.about'
                                    defaultMessage='About Mattermost'
                                />
                            </a>
                        </li>
                        <li className='divider'/>
                        <li>
                            <a
                                href='#'
                                onClick={this.handleEmitUserLoggedOutEvent}
                            >
                                <i className='icon fa fa-sign-out'/>
                                <FormattedMessage
                                    id='sidebar_right_menu.logout'
                                    defaultMessage='Logout'
                                />
                            </a>
                        </li>
                    </ul>
                </div>
                <AboutBuildModal
                    show={this.state.showAboutModal}
                    onModalDismissed={this.aboutModalDismissed}
                />
                <TeamSettingsModal
                    show={this.state.showTeamSettingsModal}
                    onModalDismissed={this.hideTeamSettingsModal}
                />
                {addUsersToTeamModal}
            </div>
        );
    }
}
