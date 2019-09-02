// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Permissions} from 'mattermost-redux/constants';
import {intlShape} from 'react-intl';

import * as GlobalActions from 'actions/global_actions.jsx';
import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
import {cmdOrCtrlPressed, isKeyPressed, localizeMessage} from 'utils/utils';
import {useSafeUrl} from 'utils/url';
import * as UserAgent from 'utils/user_agent.jsx';
import InvitationModal from 'components/invitation_modal';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';

import LeaveTeamIcon from 'components/widgets/icons/leave_team_icon';

import LeaveTeamModal from 'components/leave_team_modal';
import UserSettingsModal from 'components/user_settings/modal';
import TeamMembersModal from 'components/team_members_modal';
import TeamSettingsModal from 'components/team_settings_modal';
import AboutBuildModal from 'components/about_build_modal';
import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import Menu from 'components/widgets/menu/menu.jsx';
import TeamGroupsManageModal from 'components/team_groups_manage_modal';

export default class MainMenu extends React.PureComponent {
    static propTypes = {
        mobile: PropTypes.bool.isRequired,
        id: PropTypes.string,
        teamId: PropTypes.string,
        teamType: PropTypes.string,
        teamName: PropTypes.string,
        siteName: PropTypes.string,
        currentUser: PropTypes.object,
        appDownloadLink: PropTypes.string,
        enableCommands: PropTypes.bool.isRequired,
        enableCustomEmoji: PropTypes.bool.isRequired,
        canCreateOrDeleteCustomEmoji: PropTypes.bool.isRequired,
        enableIncomingWebhooks: PropTypes.bool.isRequired,
        enableOAuthServiceProvider: PropTypes.bool.isRequired,
        enableOutgoingWebhooks: PropTypes.bool.isRequired,
        enableUserCreation: PropTypes.bool.isRequired,
        enableEmailInvitations: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        helpLink: PropTypes.string,
        reportAProblemLink: PropTypes.string,
        moreTeamsToJoin: PropTypes.bool.isRequired,
        pluginMenuItems: PropTypes.arrayOf(PropTypes.object),
        isMentionSearch: PropTypes.bool,
        teamIsGroupConstrained: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequred,
            showMentions: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        teamType: '',
        mobile: false,
        pluginMenuItems: [],
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    toggleShortcutsModal = (e) => {
        e.preventDefault();
        GlobalActions.toggleShortcutsModal();
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

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
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

    render() {
        const {currentUser, teamIsGroupConstrained} = this.props;

        if (!currentUser) {
            return null;
        }

        const {formatMessage} = this.context.intl;

        const pluginItems = this.props.pluginMenuItems.map((item) => {
            return (
                <Menu.ItemAction
                    id={item.id + '_pluginmenuitem'}
                    key={item.id + '_pluginmenuitem'}
                    onClick={() => {
                        if (item.action) {
                            item.action();
                        }
                    }}
                    text={item.text}
                    icon={this.props.mobile && item.mobileIcon}
                />
            );
        });

        return (
            <Menu
                mobile={this.props.mobile}
                id={this.props.id}
                ariaLabel={localizeMessage('navbar_dropdown.menuAriaLabel', 'main menu')}
            >
                <Menu.Group>
                    <Menu.ItemAction
                        id='recentMentions'
                        show={this.props.mobile}
                        onClick={this.searchMentions}
                        icon={this.props.mobile && <i className='mentions'>{'@'}</i>}
                        text={localizeMessage('sidebar_right_menu.recentMentions', 'Recent Mentions')}
                    />
                    <Menu.ItemAction
                        id='flaggedPosts'
                        show={this.props.mobile}
                        onClick={this.getFlagged}
                        icon={this.props.mobile && <i className='fa fa-flag'/>}
                        text={localizeMessage('sidebar_right_menu.flagged', 'Flagged Posts')}
                    />
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemToggleModalRedux
                        id='accountSettings'
                        modalId={ModalIdentifiers.USER_SETTINGS}
                        dialogType={UserSettingsModal}
                        text={localizeMessage('navbar_dropdown.accountSettings', 'Account Settings')}
                        icon={this.props.mobile && <i className='fa fa-cog'/>}
                    />
                </Menu.Group>
                <Menu.Group>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='addGroupsToTeam'
                            show={teamIsGroupConstrained}
                            modalId={ModalIdentifiers.ADD_GROUPS_TO_TEAM}
                            dialogType={AddGroupsToTeamModal}
                            text={localizeMessage('navbar_dropdown.addGroupsToTeam', 'Add Groups to Team')}
                            icon={this.props.mobile && <i className='fa fa-user-plus'/>}
                        />
                    </TeamPermissionGate>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='invitePeople'
                            modalId={ModalIdentifiers.INVITATION}
                            dialogType={InvitationModal}
                            text={localizeMessage('navbar_dropdown.invitePeople', 'Invite People')}
                            icon={this.props.mobile && <i className='fa fa-user-plus'/>}
                        />
                    </TeamPermissionGate>
                </Menu.Group>
                <Menu.Group>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='teamSettings'
                            modalId={ModalIdentifiers.TEAM_SETTINGS}
                            dialogType={TeamSettingsModal}
                            text={localizeMessage('navbar_dropdown.teamSettings', 'Team Settings')}
                            icon={this.props.mobile && <i className='fa fa-globe'/>}
                        />
                    </TeamPermissionGate>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='manageGroups'
                            show={teamIsGroupConstrained}
                            modalId={ModalIdentifiers.MANAGE_TEAM_GROUPS}
                            dialogProps={{
                                teamID: this.props.teamId,
                            }}
                            dialogType={TeamGroupsManageModal}
                            text={localizeMessage('navbar_dropdown.manageGroups', 'Manage Groups')}
                            icon={this.props.mobile && <i className='fa fa-user-plus'/>}
                        />
                    </TeamPermissionGate>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.REMOVE_USER_FROM_TEAM, Permissions.MANAGE_TEAM_ROLES]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='manageMembers'
                            modalId={ModalIdentifiers.TEAM_MEMBERS}
                            dialogType={TeamMembersModal}
                            text={localizeMessage('navbar_dropdown.manageMembers', 'Manage Members')}
                            icon={this.props.mobile && <i className='fa fa-users'/>}
                        />
                    </TeamPermissionGate>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.REMOVE_USER_FROM_TEAM, Permissions.MANAGE_TEAM_ROLES]}
                        invert={true}
                    >
                        <Menu.ItemToggleModalRedux
                            id='viewMembers'
                            modalId={ModalIdentifiers.TEAM_MEMBERS}
                            dialogType={TeamMembersModal}
                            text={localizeMessage('navbar_dropdown.viewMembers', 'View Members')}
                            icon={this.props.mobile && <i className='fa fa-users'/>}
                        />
                    </TeamPermissionGate>
                </Menu.Group>
                <Menu.Group>
                    <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                        <Menu.ItemLink
                            id='createTeam'
                            to='/create_team'
                            text={localizeMessage('navbar_dropdown.create', 'Create a New Team')}
                            icon={this.props.mobile && <i className='fa fa-plus-square'/>}
                        />
                    </SystemPermissionGate>
                    <Menu.ItemLink
                        id='joinTeam'
                        show={!this.props.experimentalPrimaryTeam && this.props.moreTeamsToJoin}
                        to='/select_team'
                        text={localizeMessage('navbar_dropdown.join', 'Join Another Team')}
                        icon={this.props.mobile && <i className='fa fa-plus-square'/>}
                    />
                    <Menu.ItemToggleModalRedux
                        id='leaveTeam'
                        show={!teamIsGroupConstrained && this.props.experimentalPrimaryTeam !== this.props.teamName}
                        modalId={ModalIdentifiers.LEAVE_TEAM}
                        dialogType={LeaveTeamModal}
                        text={localizeMessage('navbar_dropdown.leave', 'Leave Team')}
                        icon={this.props.mobile && <LeaveTeamIcon/>}
                    />
                </Menu.Group>
                <Menu.Group>
                    {pluginItems}
                </Menu.Group>
                <Menu.Group>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_SLASH_COMMANDS, Permissions.MANAGE_OAUTH, Permissions.MANAGE_INCOMING_WEBHOOKS, Permissions.MANAGE_OUTGOING_WEBHOOKS]}
                    >
                        <Menu.ItemLink
                            id='integrations'
                            show={!this.props.mobile && (this.props.enableIncomingWebhooks || this.props.enableOutgoingWebhooks || this.props.enableCommands || this.props.enableOAuthServiceProvider)}
                            to={'/' + this.props.teamName + '/integrations'}
                            text={localizeMessage('navbar_dropdown.integrations', 'Integrations')}
                        />
                    </TeamPermissionGate>
                    <Menu.ItemLink
                        id='customEmojis'
                        show={!this.props.mobile && this.props.enableCustomEmoji && this.props.canCreateOrDeleteCustomEmoji}
                        to={'/' + this.props.teamName + '/emoji'}
                        text={localizeMessage('navbar_dropdown.emoji', 'Custom Emoji')}
                    />
                </Menu.Group>
                <Menu.Group>
                    <SystemPermissionGate permissions={[Permissions.MANAGE_SYSTEM]}>
                        <Menu.ItemLink
                            id='systemConsole'
                            show={!this.props.mobile}
                            to='/admin_console'
                            text={localizeMessage('navbar_dropdown.console', 'System Console')}
                            icon={this.props.mobile && <i className='fa fa-wrench'/>}
                        />
                    </SystemPermissionGate>
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemExternalLink
                        id='helpLink'
                        show={Boolean(this.props.helpLink)}
                        url={this.props.helpLink}
                        text={localizeMessage('navbar_dropdown.help', 'Help')}
                        icon={this.props.mobile && <i className='fa fa-question'/>}
                    />
                    <Menu.ItemAction
                        id='keyboardShortcuts'
                        show={!this.props.mobile}
                        onClick={this.toggleShortcutsModal}
                        text={localizeMessage('navbar_dropdown.keyboardShortcuts', 'Keyboard Shortcuts')}
                    />
                    <Menu.ItemExternalLink
                        id='reportLink'
                        show={Boolean(this.props.reportAProblemLink)}
                        url={this.props.reportAProblemLink}
                        text={localizeMessage('navbar_dropdown.report', 'Report a Problem')}
                        icon={this.props.mobile && <i className='fa fa-phone'/>}
                    />
                    <Menu.ItemExternalLink
                        id='nativeAppLink'
                        show={this.props.appDownloadLink && !UserAgent.isMobileApp()}
                        url={useSafeUrl(this.props.appDownloadLink)}
                        text={localizeMessage('navbar_dropdown.nativeApps', 'Download Apps')}
                        icon={this.props.mobile && <i className='fa fa-mobile'/>}
                    />
                    <Menu.ItemToggleModalRedux
                        id='about'
                        modalId={ModalIdentifiers.ABOUT}
                        dialogType={AboutBuildModal}
                        text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: this.props.siteName || 'Mattermost'})}
                        icon={this.props.mobile && <i className='fa fa-info'/>}
                    />
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        id='logout'
                        onClick={this.handleEmitUserLoggedOutEvent}
                        text={localizeMessage('navbar_dropdown.logout', 'Logout')}
                        icon={this.props.mobile && <i className='fa fa-sign-out'/>}
                    />
                </Menu.Group>
            </Menu>
        );
    }
}
