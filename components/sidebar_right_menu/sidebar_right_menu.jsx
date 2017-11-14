// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router';

import * as GlobalActions from 'actions/global_actions.jsx';

import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';

import {Constants, WebrtcActionTypes} from 'utils/constants.jsx';
import {useSafeUrl} from 'utils/url.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

import AboutBuildModal from 'components/about_build_modal';
import AddUsersToTeam from 'components/add_users_to_team';
import TeamMembersModal from 'components/team_members_modal';
import {createMenuTip} from 'components/tutorial/tutorial_tip.jsx';

import ToggleModalButton from '../toggle_modal_button.jsx';

const Preferences = Constants.Preferences;
const TutorialSteps = Constants.TutorialSteps;

export default class SidebarRightMenu extends React.Component {
    static propTypes = {
        teamType: PropTypes.string,
        teamDisplayName: PropTypes.string,
        isMentionSearch: PropTypes.bool,
        actions: PropTypes.shape({
            showMentions: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func
        })
    };

    constructor(props) {
        super(props);

        this.state = {
            ...this.getStateFromStores(),
            showAboutModal: false,
            showAddUsersToTeamModal: false
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
            showDropdown: false
        });
    }

    hideAddUsersToTeamModal = () => {
        this.setState({
            showAddUsersToTeamModal: false
        });
    }

    getFlagged = (e) => {
        e.preventDefault();
        this.props.actions.showFlaggedPosts();
        this.closeRightSidebar();
    }

    getStateFromStores = () => {
        const tutorialStep = PreferenceStore.getInt(Preferences.TUTORIAL_STEP, UserStore.getCurrentId(), 999);

        return {
            currentUser: UserStore.getCurrentUser(),
            teamMembers: TeamStore.getMyTeamMembers(),
            teamListings: TeamStore.getTeamListings(),
            showTutorialTip: tutorialStep === TutorialSteps.MENU_POPOVER && Utils.isMobile() && global.window.mm_config.EnableTutorial === 'true'
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
            this.closeRightSidebar();
            this.props.actions.showMentions();
        }
    }

    closeLeftSidebar = () => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .inner-wrap').classList.remove('move--right');
                document.querySelector('.app__body .sidebar--left').classList.remove('move--right');
            });
        }
    }

    openRightSidebar = () => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .inner-wrap').classList.add('move--left-small');
                document.querySelector('.app__body .sidebar--menu').classList.add('move--left');
            });
        }
    }

    closeRightSidebar = () => {
        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .inner-wrap').classList.remove('move--left-small');
                document.querySelector('.app__body .sidebar--menu').classList.remove('move--left');
            });
        }
    }

    render() {
        const currentUser = UserStore.getCurrentUser();
        let teamLink;
        let inviteLink;
        let addUserToTeamLink;
        let teamSettingsLink;
        let manageLink;
        let consoleLink;
        let joinAnotherTeamLink;
        let isAdmin = false;
        let isSystemAdmin = false;
        let createTeam = null;

        if (currentUser != null) {
            isAdmin = TeamStore.isTeamAdminForCurrentTeam() || UserStore.isSystemAdminForCurrentUser();
            isSystemAdmin = UserStore.isSystemAdminForCurrentUser();

            inviteLink = (
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
            );

            addUserToTeamLink = (
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
            );

            if (this.props.teamType === Constants.OPEN_TEAM && global.mm_config.EnableUserCreation === 'true') {
                teamLink = (
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
                );
            }

            if (global.window.mm_license.IsLicensed === 'true') {
                if (global.window.mm_config.RestrictTeamInvite === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
                    teamLink = null;
                    inviteLink = null;
                    addUserToTeamLink = null;
                } else if (global.window.mm_config.RestrictTeamInvite === Constants.PERMISSIONS_TEAM_ADMIN && !isAdmin) {
                    teamLink = null;
                    inviteLink = null;
                    addUserToTeamLink = null;
                }
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

            if (moreTeams) {
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

            if (global.window.mm_config.EnableTeamCreation === 'true' || isSystemAdmin) {
                createTeam = (
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
                );
            }
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

        const leaveTeam = (
            <li key='leaveTeam_li'>
                <a
                    id='leaveTeam'
                    href='#'
                    onClick={GlobalActions.showLeaveTeamModal}
                >
                    <span
                        className='icon'
                        dangerouslySetInnerHTML={{__html: Constants.LEAVE_TEAM_SVG}}
                    />
                    <FormattedMessage
                        id='navbar_dropdown.leave'
                        defaultMessage='Leave Team'
                    />
                </a>
            </li>
        );

        if (isAdmin) {
            teamSettingsLink = (
                <li>
                    <a
                        href='#'
                        data-toggle='modal'
                        data-target='#team_settings'
                    >
                        <i className='icon fa fa-globe'/>
                        <FormattedMessage
                            id='sidebar_right_menu.teamSettings'
                            defaultMessage='Team Settings'
                        />
                    </a>
                </li>
            );
            manageLink = (
                <li>
                    <ToggleModalButton
                        dialogType={TeamMembersModal}
                        dialogProps={{isAdmin}}
                    >
                        <i className='icon fa fa-users'/>
                        <FormattedMessage
                            id='sidebar_right_menu.manageMembers'
                            defaultMessage='Manage Members'
                        />
                    </ToggleModalButton>
                </li>
            );
        }

        if (isSystemAdmin && !Utils.isMobile()) {
            consoleLink = (
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
            );
        }

        var siteName = '';
        if (global.window.mm_config.SiteName != null) {
            siteName = global.window.mm_config.SiteName;
        }
        var teamDisplayName = siteName;
        if (this.props.teamDisplayName) {
            teamDisplayName = this.props.teamDisplayName;
        }

        let helpLink = null;
        if (global.window.mm_config.HelpLink) {
            helpLink = (
                <li>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        to={global.window.mm_config.HelpLink}
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
        if (global.window.mm_config.ReportAProblemLink) {
            reportLink = (
                <li>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        to={global.window.mm_config.ReportAProblemLink}
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
        if (this.state.showTutorialTip) {
            tutorialTip = createMenuTip((e) => e.preventDefault(), true);
            this.closeLeftSidebar();
            this.openRightSidebar();
        }

        let nativeAppLink = null;
        if (global.window.mm_config.AppDownloadLink && !UserAgent.isMobileApp()) {
            nativeAppLink = (
                <li>
                    <Link
                        target='_blank'
                        rel='noopener noreferrer'
                        to={useSafeUrl(global.window.mm_config.AppDownloadLink)}
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
                className='sidebar--menu'
                id='sidebar-menu'
            >
                <div className='team__header theme'>
                    <Link
                        className='team__name'
                        to='/channels/town-square'
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
                                onClick={() => GlobalActions.showAccountSettingsModal()}
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
                                onClick={() => GlobalActions.emitUserLoggedOutEvent()}
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
                {addUsersToTeamModal}
            </div>
        );
    }
}
