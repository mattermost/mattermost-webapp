// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {Permissions} from 'mattermost-redux/constants';
import classNames from 'classnames';

import * as GlobalActions from 'actions/global_actions.jsx';
import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
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
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import LeaveTeamModal from 'components/leave_team_modal';
import UserSettingsModal from 'components/user_settings/modal';
import InviteMemberModal from 'components/invite_member_modal';

export default class SidebarRightMenu extends React.PureComponent {
    static propTypes = {
        teamId: PropTypes.string,
        currentUserId: PropTypes.string.isRequired,
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
        moreTeamsToJoin: PropTypes.bool.isRequired,
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
            showAboutModal: false,
            showAddUsersToTeamModal: false,
            showTeamSettingsModal: false,
        };
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

    searchMentions = (e) => {
        e.preventDefault();

        if (this.props.isMentionSearch) {
            this.props.actions.closeRightHandSide();
        } else {
            this.props.actions.closeRhsMenu();
            this.props.actions.showMentions();
        }
    }

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    render() {
        let teamLink;
        let inviteLink;
        let addUserToTeamLink;
        let manageLink;
        let consoleLink;
        let joinAnotherTeamLink;
        let createTeam = null;

        if (this.props.currentUserId != null) {
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
                            <ToggleModalButtonRedux
                                id='emailInviteMobile'
                                role='menuitem'
                                modalId={ModalIdentifiers.EMAIL_INVITE}
                                dialogType={InviteMemberModal}
                                dialogProps={{}}
                            >
                                <i className='icon fa fa-user-plus'/>
                                <FormattedMessage
                                    id='sidebar_right_menu.inviteNew'
                                    defaultMessage='Send Email Invite'
                                />
                            </ToggleModalButtonRedux>
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

            if (this.props.moreTeamsToJoin && !this.props.experimentalPrimaryTeam) {
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
            return (
                <li key={item.id + '_pluginrightmenuitem'}>
                    <a
                        id={item.id + '_pluginrightmenuitem'}
                        href='#'
                        onClick={item.action}
                    >
                        <span className='icon'>{item.mobileIcon}</span>
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
                    <ToggleModalButtonRedux
                        id='leaveTeam'
                        role='menuitem'
                        modalId={ModalIdentifiers.LEAVE_TEAM}
                        dialogType={LeaveTeamModal}
                        dialogProps={{}}
                    >
                        <LeaveTeamIcon className='icon'/>
                        <FormattedMessage
                            id='navbar_dropdown.leave'
                            defaultMessage='Leave Team'
                        />
                    </ToggleModalButtonRedux>
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
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={useSafeUrl(this.props.helpLink)}
                    >
                        <i className='icon fa fa-question'/>
                        <FormattedMessage
                            id='sidebar_right_menu.help'
                            defaultMessage='Help'
                        />
                    </a>
                </li>
            );
        }

        let reportLink = null;
        if (this.props.reportAProblemLink) {
            reportLink = (
                <li>
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={useSafeUrl(this.props.reportAProblemLink)}
                    >
                        <i className='icon fa fa-phone'/>
                        <FormattedMessage
                            id='sidebar_right_menu.report'
                            defaultMessage='Report a Problem'
                        />
                    </a>
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
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={useSafeUrl(this.props.appDownloadLink)}
                    >
                        <i className='icon fa fa-mobile'/>
                        <FormattedMessage
                            id='sidebar_right_menu.nativeApps'
                            defaultMessage='Download Apps'
                        />
                    </a>
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
                            <ToggleModalButtonRedux
                                modalId={ModalIdentifiers.USER_SETTINGS}
                                dialogType={UserSettingsModal}
                            >
                                <i className='icon fa fa-cog'/>
                                <FormattedMessage
                                    id='sidebar_right_menu.accountSettings'
                                    defaultMessage='Account Settings'
                                />
                            </ToggleModalButtonRedux>
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
