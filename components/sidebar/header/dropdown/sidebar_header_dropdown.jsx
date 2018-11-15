// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Dropdown} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {Permissions} from 'mattermost-redux/constants';

import * as GlobalActions from 'actions/global_actions.jsx';
import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';
import {useSafeUrl} from 'utils/url';
import * as UserAgent from 'utils/user_agent.jsx';
import AboutBuildModal from 'components/about_build_modal';
import AddUsersToTeam from 'components/add_users_to_team';
import TeamMembersModal from 'components/team_members_modal';
import TeamSettingsModal from 'components/team_settings_modal.jsx';
import InviteMemberModal from 'components/invite_member_modal';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';

import SidebarHeaderDropdownButton from '../sidebar_header_dropdown_button.jsx';

import LeaveTeamModal from 'components/leave_team_modal';
import UserSettingsModal from 'components/user_settings/modal';
import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';

export default class SidebarHeaderDropdown extends React.PureComponent {
    static propTypes = {
        teamId: PropTypes.string,
        teamType: PropTypes.string,
        teamName: PropTypes.string,
        currentUser: PropTypes.object,
        appDownloadLink: PropTypes.string,
        enableCommands: PropTypes.bool.isRequired,
        enableCustomEmoji: PropTypes.bool.isRequired,
        canCreateCustomEmoji: PropTypes.bool.isRequired,
        enableIncomingWebhooks: PropTypes.bool.isRequired,
        enableOAuthServiceProvider: PropTypes.bool.isRequired,
        enableOutgoingWebhooks: PropTypes.bool.isRequired,
        enableUserCreation: PropTypes.bool.isRequired,
        enableEmailInvitations: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        helpLink: PropTypes.string,
        reportAProblemLink: PropTypes.string,
        showDropdown: PropTypes.bool.isRequired,
        onToggleDropdown: PropTypes.func.isRequired,
        moreTeamsToJoin: PropTypes.bool.isRequired,
        pluginMenuItems: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequred,
        }).isRequired,
    };

    static defaultProps = {
        teamType: '',
        pluginMenuItems: [],
    };

    constructor(props) {
        super(props);

        this.state = {
            showAboutModal: false,
            showTeamSettingsModal: false,
            showTeamMembersModal: false,
            showAddUsersToTeamModal: false,
        };
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

    handleAboutModal = (e) => {
        e.preventDefault();

        this.setState({
            showAboutModal: true,
        });
        this.props.onToggleDropdown(false);
    }

    aboutModalDismissed = () => {
        this.setState({showAboutModal: false});
    }

    toggleShortcutsModal = (e) => {
        e.preventDefault();
        this.props.onToggleDropdown(false);

        GlobalActions.toggleShortcutsModal();
    }

    showAddUsersToTeamModal = (e) => {
        e.preventDefault();

        this.setState({
            showAddUsersToTeamModal: true,
        });
        this.props.onToggleDropdown(false);
    }

    hideAddUsersToTeamModal = () => {
        this.setState({
            showAddUsersToTeamModal: false,
        });
    }

    showInviteMemberModal = (e) => {
        e.preventDefault();

        this.props.onToggleDropdown(false);

        this.props.actions.openModal({ModalId: ModalIdentifiers.EMAIL_INVITE, dialogType: InviteMemberModal});
    }

    showGetTeamInviteLinkModal = (e) => {
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

    showTeamMembersModal = (e) => {
        e.preventDefault();

        this.setState({
            showTeamMembersModal: true,
        });
    }

    hideTeamMembersModal = () => {
        this.setState({
            showTeamMembersModal: false,
        });
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (e) => {
        if (cmdOrCtrlPressed(e) && e.shiftKey && isKeyPressed(e, Constants.KeyCodes.A)) {
            this.props.actions.openModal({ModalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal});
        }
    }

    showAccountSettingsModal = (e) => {
        e.preventDefault();

        this.props.onToggleDropdown(false);

        this.props.actions.openModal({ModalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal});
    }

    renderCustomEmojiLink = () => {
        if (!this.props.enableCustomEmoji || !this.props.canCreateCustomEmoji) {
            return null;
        }

        return (
            <li>
                <Link
                    id='customEmoji'
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
        let sysAdminLink = '';
        let teamSettings = null;
        let integrationsLink = null;

        if (!currentUser) {
            return null;
        }

        if (currentUser != null) {
            if (this.props.enableEmailInvitations) {
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
                        </TeamPermissionGate>
                    </TeamPermissionGate>
                );
            }

            addMemberToTeam = (
                <TeamPermissionGate
                    teamId={this.props.teamId}
                    permissions={[Permissions.ADD_USER_TO_TEAM]}
                >
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
                        </TeamPermissionGate>
                    </TeamPermissionGate>
                );
            }
        }

        teamSettings = (
            <TeamPermissionGate
                teamId={this.props.teamId}
                permissions={[Permissions.MANAGE_TEAM]}
            >
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
            </TeamPermissionGate>
        );

        const manageLink = (
            <li>
                <button
                    id='manageMembers'
                    className='style--none'
                    onClick={this.showTeamMembersModal}
                >
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.manageMembers'
                            defaultMessage='Manage Members'
                        />
                    </TeamPermissionGate>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                        invert={true}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.viewMembers'
                            defaultMessage='View Members'
                        />
                    </TeamPermissionGate>
                </button>
            </li>
        );

        const integrationsEnabled =
            this.props.enableIncomingWebhooks ||
            this.props.enableOutgoingWebhooks ||
            this.props.enableCommands ||
            this.props.enableOAuthServiceProvider;
        if (integrationsEnabled) {
            integrationsLink = (
                <TeamPermissionGate
                    teamId={this.props.teamId}
                    permissions={[Permissions.MANAGE_SLASH_COMMANDS, Permissions.MANAGE_OAUTH, Permissions.MANAGE_WEBHOOKS]}
                >
                    <li>
                        <Link
                            id='Integrations'
                            to={'/' + this.props.teamName + '/integrations'}
                        >
                            <FormattedMessage
                                id='navbar_dropdown.integrations'
                                defaultMessage='Integrations'
                            />
                        </Link>
                    </li>
                </TeamPermissionGate>
            );
        }

        sysAdminLink = (
            <SystemPermissionGate permissions={[Permissions.MANAGE_SYSTEM]}>
                <li>
                    <Link
                        id='systemConsole'
                        to={'/admin_console'}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.console'
                            defaultMessage='System Console'
                        />
                    </Link>
                </li>
            </SystemPermissionGate>
        );

        const teams = [];

        teams.push(
            <SystemPermissionGate
                permissions={[Permissions.CREATE_TEAM]}
                key='newTeam_permission'
            >
                <li key='newTeam_li'>
                    <Link
                        id='createTeam'
                        key='newTeam_a'
                        to='/create_team'
                    >
                        <FormattedMessage
                            id='navbar_dropdown.create'
                            defaultMessage='Create a New Team'
                        />
                    </Link>
                </li>
            </SystemPermissionGate>
        );

        if (!this.props.experimentalPrimaryTeam) {
            if (this.props.moreTeamsToJoin) {
                teams.push(
                    <li key='joinTeam_li'>
                        <Link
                            id='joinAnotherTeam'
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
                    <ToggleModalButtonRedux
                        id='leaveTeam'
                        role='menuitem'
                        modalId={ModalIdentifiers.LEAVE_TEAM}
                        dialogType={LeaveTeamModal}
                        dialogProps={{}}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.leave'
                            defaultMessage='Leave Team'
                        />
                    </ToggleModalButtonRedux>
                </li>
            );
        }

        const pluginItems = this.props.pluginMenuItems.map((item) => {
            return (
                <li key={item.id + '_pluginmenuitem'}>
                    <a
                        id={item.id + '_pluginmenuitem'}
                        href='#'
                        onClick={() => {
                            if (item.action) {
                                item.action();
                            }
                            this.toggleDropdown(false);
                        }}
                    >
                        {item.text}
                    </a>
                </li>
            );
        });

        let pluginDivider = null;
        if (pluginItems.length > 0) {
            pluginDivider = <li className='divider'/>;
        }

        let helpLink = null;
        if (this.props.helpLink) {
            helpLink = (
                <li>
                    <a
                        id='helpLink'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={this.props.helpLink}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.help'
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
                        id='reportLink'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={this.props.reportAProblemLink}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.report'
                            defaultMessage='Report a Problem'
                        />
                    </a>
                </li>
            );
        }

        let nativeAppLink = null;
        if (this.props.appDownloadLink && !UserAgent.isMobileApp()) {
            nativeAppLink = (
                <li>
                    <a
                        id='nativeAppLink'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={useSafeUrl(this.props.appDownloadLink)}
                    >
                        <FormattedMessage
                            id='navbar_dropdown.nativeApps'
                            defaultMessage='Download Apps'
                        />
                    </a>
                </li>
            );
        }

        let teamMembersModal;
        if (this.state.showTeamMembersModal) {
            teamMembersModal = (
                <TeamMembersModal
                    onLoad={this.toggleDropdown}
                    onHide={this.hideTeamMembersModal}
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
            >
                <SidebarHeaderDropdownButton
                    bsRole='toggle'
                    onClick={this.toggleDropdown}
                />
                <Dropdown.Menu
                    id='sidebarDropdownMenu'
                >
                    {accountSettings}
                    {inviteDivider}
                    {inviteLink}
                    {teamLink}
                    {addMemberToTeam}
                    {teamDivider}
                    {teamSettings}
                    {manageLink}
                    {teams}
                    {pluginDivider}
                    {pluginItems}
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
