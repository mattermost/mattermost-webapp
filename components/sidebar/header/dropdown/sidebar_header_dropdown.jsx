// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Dropdown} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import {Constants, WebrtcActionTypes} from 'utils/constants.jsx';
import {useSafeUrl} from 'utils/url';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import AboutBuildModal from 'components/about_build_modal';
import AddUsersToTeam from 'components/add_users_to_team';
import TeamMembersModal from 'components/team_members_modal';
import TeamSettingsModal from 'components/team_settings_modal.jsx';

import SidebarHeaderDropdownButton from '../sidebar_header_dropdown_button.jsx';

export default class SidebarHeaderDropdown extends React.Component {
    static propTypes = {
        teamType: PropTypes.string,
        teamDisplayName: PropTypes.string,
        teamName: PropTypes.string,
        currentUser: PropTypes.object,
        isLicensed: PropTypes.bool.isRequired,
        appDownloadLink: PropTypes.string,
        enableCommands: PropTypes.bool.isRequired,
        enableCustomEmoji: PropTypes.bool.isRequired,
        enableIncomingWebhooks: PropTypes.bool.isRequired,
        enableOAuthServiceProvider: PropTypes.bool.isRequired,
        enableOnlyAdminIntegrations: PropTypes.bool.isRequired,
        enableOutgoingWebhooks: PropTypes.bool.isRequired,
        enableTeamCreation: PropTypes.bool.isRequired,
        enableUserCreation: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        helpLink: PropTypes.string,
        reportAProblemLink: PropTypes.string,
        restrictTeamInvite: PropTypes.string,
        showDropdown: PropTypes.bool.isRequired,
        onToggleDropdown: PropTypes.func.isRequired,
    };

    static defaultProps = {
        teamType: '',
    };

    constructor(props) {
        super(props);

        this.handleAboutModal = this.handleAboutModal.bind(this);
        this.aboutModalDismissed = this.aboutModalDismissed.bind(this);
        this.showAccountSettingsModal = this.showAccountSettingsModal.bind(this);
        this.showAddUsersToTeamModal = this.showAddUsersToTeamModal.bind(this);
        this.hideAddUsersToTeamModal = this.hideAddUsersToTeamModal.bind(this);
        this.showInviteMemberModal = this.showInviteMemberModal.bind(this);
        this.showGetTeamInviteLinkModal = this.showGetTeamInviteLinkModal.bind(this);
        this.showTeamMembersModal = this.showTeamMembersModal.bind(this);
        this.hideTeamMembersModal = this.hideTeamMembersModal.bind(this);
        this.toggleShortcutsModal = this.toggleShortcutsModal.bind(this);

        this.onTeamChange = this.onTeamChange.bind(this);

        this.renderCustomEmojiLink = this.renderCustomEmojiLink.bind(this);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            teamMembers: TeamStore.getMyTeamMembers(),
            teamListings: TeamStore.getTeamListings(),
            showAboutModal: false,
            showTeamSettingsModal: false,
            showTeamMembersModal: false,
            showAddUsersToTeamModal: false,
        };
    }

    handleClick(e) {
        if (WebrtcStore.isBusy()) {
            WebrtcStore.emitChanged({action: WebrtcActionTypes.IN_PROGRESS});
            e.preventDefault();
        }
    }

    toggleDropdown = (val) => {
        if (typeof (val) === 'boolean') {
            this.props.onToggleDropdown(val);
            return;
        }

        if (val && val.preventDefault) {
            val.preventDefault();
        }

        this.props.onToggleDropdown();
    }

    handleAboutModal(e) {
        e.preventDefault();

        this.setState({
            showAboutModal: true,
        });
        this.props.onToggleDropdown(false);
    }

    aboutModalDismissed() {
        this.setState({showAboutModal: false});
    }

    showAccountSettingsModal(e) {
        e.preventDefault();

        this.props.onToggleDropdown(false);

        GlobalActions.showAccountSettingsModal();
    }

    toggleShortcutsModal(e) {
        e.preventDefault();
        this.props.onToggleDropdown(false);

        GlobalActions.toggleShortcutsModal();
    }

    showAddUsersToTeamModal(e) {
        e.preventDefault();

        this.setState({
            showAddUsersToTeamModal: true,
        });
        this.props.onToggleDropdown(false);
    }

    hideAddUsersToTeamModal() {
        this.setState({
            showAddUsersToTeamModal: false,
        });
    }

    showInviteMemberModal(e) {
        e.preventDefault();

        this.props.onToggleDropdown(false);

        GlobalActions.showInviteMemberModal();
    }

    showGetTeamInviteLinkModal(e) {
        e.preventDefault();

        this.props.onToggleDropdown(false);

        GlobalActions.showGetTeamInviteLinkModal();
    }

    showTeamSettingsModal = (e) => {
        e.preventDefault();

        this.setState({
            showTeamSettingsModal: true,
        });
        this.props.onToggleDropdown(false);
    }

    hideTeamSettingsModal = () => {
        this.setState({
            showTeamSettingsModal: false,
        });
    }

    showTeamMembersModal(e) {
        e.preventDefault();

        this.setState({
            showTeamMembersModal: true,
        });
    }

    hideTeamMembersModal() {
        this.setState({
            showTeamMembersModal: false,
        });
    }

    componentDidMount() {
        TeamStore.addChangeListener(this.onTeamChange);
    }

    onTeamChange() {
        this.setState({
            teamMembers: TeamStore.getMyTeamMembers(),
            teamListings: TeamStore.getTeamListings(),
        });
        this.props.onToggleDropdown(false);
    }

    componentWillUnmount() {
        $(ReactDOM.findDOMNode(this.refs.dropdown)).off('hide.bs.dropdown');
        TeamStore.removeChangeListener(this.onTeamChange);
    }

    renderCustomEmojiLink() {
        if (!this.props.enableCustomEmoji || !Utils.canCreateCustomEmoji(this.props.currentUser)) {
            return null;
        }

        return (
            <li>
                <Link
                    id='customEmoji'
                    onClick={this.handleClick}
                    to={'/' + this.props.teamName + '/emoji'}
                >
                    <FormattedMessage
                        id='navbar_dropdown.emoji'
                        defaultMessage='Custom Emoji'
                    />
                </Link>
            </li>
        );
    }

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    render() {
        const currentUser = this.props.currentUser;
        let teamLink = '';
        let inviteLink = '';
        let addMemberToTeam = '';
        let manageLink = '';
        let sysAdminLink = '';
        let isAdmin = false;
        let isSystemAdmin = false;
        let teamSettings = null;
        let integrationsLink = null;

        if (!currentUser) {
            return null;
        }

        if (currentUser != null) {
            isAdmin = TeamStore.isTeamAdminForCurrentTeam() || UserStore.isSystemAdminForCurrentUser();
            isSystemAdmin = UserStore.isSystemAdminForCurrentUser();

            inviteLink = (
                <li>
                    <button
                        className='style--none'
                        id='sendEmailInvite'
                        onClick={this.showInviteMemberModal}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.inviteMember'
                            defaultMessage='Send Email Invite'
                        />
                    </button>
                </li>
            );

            addMemberToTeam = (
                <li>
                    <button
                        className='style--none'
                        id='addUsersToTeam'
                        onClick={this.showAddUsersToTeamModal}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.addMemberToTeam'
                            defaultMessage='Add Members to Team'
                        />
                    </button>
                </li>
            );

            if (this.props.teamType === Constants.OPEN_TEAM && this.props.enableUserCreation) {
                teamLink = (
                    <li>
                        <button
                            className='style--none'
                            id='getTeamInviteLink'
                            onClick={this.showGetTeamInviteLinkModal}
                        >
                            <FormattedMessage
                                id='navbar_dropdown.teamLink'
                                defaultMessage='Get Team Invite Link'
                            />
                        </button>
                    </li>
                );
            }

            if (this.props.isLicensed) {
                if (this.props.restrictTeamInvite === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
                    teamLink = null;
                    inviteLink = null;
                    addMemberToTeam = null;
                } else if (this.props.restrictTeamInvite === Constants.PERMISSIONS_TEAM_ADMIN && !isAdmin) {
                    teamLink = null;
                    inviteLink = null;
                    addMemberToTeam = null;
                }
            }
        }

        let membersName = (
            <FormattedMessage
                id='navbar_dropdown.manageMembers'
                defaultMessage='Manage Members'
            />
        );

        if (isAdmin) {
            teamSettings = (
                <li>
                    <button
                        className='style--none'
                        id='teamSettings'
                        onClick={this.showTeamSettingsModal}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.teamSettings'
                            defaultMessage='Team Settings'
                        />
                    </button>
                </li>
            );
        } else {
            membersName = (
                <FormattedMessage
                    id='navbar_dropdown.viewMembers'
                    defaultMessage='View Members'
                />
            );
        }

        manageLink = (
            <li>
                <button
                    id='manageMembers'
                    className='style--none'
                    onClick={this.showTeamMembersModal}
                >
                    {membersName}
                </button>
            </li>
        );

        const integrationsEnabled =
            this.props.enableIncomingWebhooks ||
            this.props.enableOutgoingWebhooks ||
            this.props.enableCommands ||
            (this.props.enableOAuthServiceProvider && (isSystemAdmin || !this.props.enableOnlyAdminIntegrations));
        if (integrationsEnabled && (isAdmin || !this.props.enableOnlyAdminIntegrations)) {
            integrationsLink = (
                <li>
                    <Link
                        id='Integrations'
                        to={'/' + this.props.teamName + '/integrations'}
                        onClick={this.handleClick}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.integrations'
                            defaultMessage='Integrations'
                        />
                    </Link>
                </li>
            );
        }

        if (isSystemAdmin) {
            sysAdminLink = (
                <li>
                    <Link
                        id='systemConsole'
                        to={'/admin_console'}
                        onClick={this.handleClick}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.console'
                            defaultMessage='System Console'
                        />
                    </Link>
                </li>
            );
        }

        const teams = [];
        let moreTeams = false;

        if (this.props.enableTeamCreation || UserStore.isSystemAdminForCurrentUser()) {
            teams.push(
                <li key='newTeam_li'>
                    <Link
                        id='createTeam'
                        key='newTeam_a'
                        to='/create_team'
                        onClick={this.handleClick}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.create'
                            defaultMessage='Create a New Team'
                        />
                    </Link>
                </li>
            );
        }

        if (!this.props.experimentalPrimaryTeam) {
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
                teams.push(
                    <li key='joinTeam_li'>
                        <Link
                            id='joinAnotherTeam'
                            onClick={this.handleClick}
                            to='/select_team'
                        >
                            <FormattedMessage
                                id='navbar_dropdown.join'
                                defaultMessage='Join Another Team'
                            />
                        </Link>
                    </li>
                );
            }

            teams.push(
                <li key='leaveTeam_li'>
                    <button
                        className='style--none'
                        id='leaveTeam'
                        onClick={GlobalActions.showLeaveTeamModal}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.leave'
                            defaultMessage='Leave Team'
                        />
                    </button>
                </li>
            );
        }

        let helpLink = null;
        if (this.props.helpLink) {
            helpLink = (
                <li>
                    <Link
                        id='helpLink'
                        target='_blank'
                        rel='noopener noreferrer'
                        to={this.props.helpLink}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.help'
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
                        id='reportLink'
                        target='_blank'
                        rel='noopener noreferrer'
                        to={this.props.reportAProblemLink}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.report'
                            defaultMessage='Report a Problem'
                        />
                    </Link>
                </li>
            );
        }

        let nativeAppLink = null;
        if (this.props.appDownloadLink && !UserAgent.isMobileApp()) {
            nativeAppLink = (
                <li>
                    <Link
                        id='nativeAppLink'
                        target='_blank'
                        rel='noopener noreferrer'
                        to={useSafeUrl(this.props.appDownloadLink)}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.nativeApps'
                            defaultMessage='Download Apps'
                        />
                    </Link>
                </li>
            );
        }

        let teamMembersModal;
        if (this.state.showTeamMembersModal) {
            teamMembersModal = (
                <TeamMembersModal
                    onLoad={this.toggleDropdown}
                    onHide={this.hideTeamMembersModal}
                    isAdmin={isAdmin}
                />
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

        const keyboardShortcuts = (
            <li>
                <button
                    className='style--none'
                    id='keyboardShortcuts'
                    onClick={this.toggleShortcutsModal}
                >
                    <FormattedMessage
                        id='navbar_dropdown.keyboardShortcuts'
                        defaultMessage='Keyboard Shortcuts'
                    />
                </button>
            </li>
        );

        const accountSettings = (
            <li>
                <button
                    className='style--none'
                    id='accountSettings'
                    onClick={this.showAccountSettingsModal}
                >
                    <FormattedMessage
                        id='navbar_dropdown.accountSettings'
                        defaultMessage='Account Settings'
                    />
                </button>
            </li>
        );

        const about = (
            <li>
                <button
                    id='about'
                    className='style--none'
                    onClick={this.handleAboutModal}
                >
                    <FormattedMessage
                        id='navbar_dropdown.about'
                        defaultMessage='About Mattermost'
                    />
                </button>
            </li>
        );

        const logout = (
            <li>
                <button
                    className='style--none'
                    id='logout'
                    onClick={this.handleEmitUserLoggedOutEvent}
                >
                    <FormattedMessage
                        id='navbar_dropdown.logout'
                        defaultMessage='Logout'
                    />
                </button>
            </li>
        );

        const customEmoji = this.renderCustomEmojiLink();

        // Dividers.
        let inviteDivider = null;
        if (inviteLink || teamLink || addMemberToTeam) {
            inviteDivider = <li className='divider'/>;
        }

        let teamDivider = null;
        if (teamSettings || manageLink || teams) {
            teamDivider = <li className='divider'/>;
        }

        let backstageDivider = null;
        if (integrationsLink || customEmoji) {
            backstageDivider = <li className='divider'/>;
        }

        let sysAdminDivider = null;
        if (sysAdminLink) {
            sysAdminDivider = <li className='divider'/>;
        }

        let helpDivider = null;
        if (helpLink || reportLink || nativeAppLink || about) {
            helpDivider = <li className='divider'/>;
        }

        let logoutDivider = null;
        if (logout) {
            logoutDivider = <li className='divider'/>;
        }

        return (
            <Dropdown
                id='sidebar-header-dropdown'
                open={this.props.showDropdown}
                onToggle={this.toggleDropdown}
                className='sidebar-header-dropdown'
                pullRight={true}
            >
                <SidebarHeaderDropdownButton
                    bsRole='toggle'
                    onClick={this.toggleDropdown}
                />
                <Dropdown.Menu id='sidebarDropdownMenu'>
                    {accountSettings}
                    {inviteDivider}
                    {inviteLink}
                    {teamLink}
                    {addMemberToTeam}
                    {teamDivider}
                    {teamSettings}
                    {manageLink}
                    {teams}
                    {backstageDivider}
                    {integrationsLink}
                    {customEmoji}
                    {sysAdminDivider}
                    {sysAdminLink}
                    {helpDivider}
                    {helpLink}
                    {keyboardShortcuts}
                    {reportLink}
                    {nativeAppLink}
                    {about}
                    {logoutDivider}
                    {logout}
                    {teamMembersModal}
                    <TeamSettingsModal
                        show={this.state.showTeamSettingsModal}
                        onModalDismissed={this.hideTeamSettingsModal}
                    />
                    <AboutBuildModal
                        show={this.state.showAboutModal}
                        onModalDismissed={this.aboutModalDismissed}
                    />
                    {addUsersToTeamModal}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
