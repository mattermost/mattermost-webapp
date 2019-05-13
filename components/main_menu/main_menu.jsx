// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Permissions} from 'mattermost-redux/constants';

import * as GlobalActions from 'actions/global_actions.jsx';
import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
import {cmdOrCtrlPressed, isKeyPressed, localizeMessage} from 'utils/utils';
import {useSafeUrl} from 'utils/url';
import * as UserAgent from 'utils/user_agent.jsx';
import InviteMemberModal from 'components/invite_member_modal';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';

import LeaveTeamIcon from 'components/svg/leave_team_icon';

import LeaveTeamModal from 'components/leave_team_modal';
import UserSettingsModal from 'components/user_settings/modal';
import TeamMembersModal from 'components/team_members_modal';
import TeamSettingsModal from 'components/team_settings_modal';
import AboutBuildModal from 'components/about_build_modal';
import AddUsersToTeam from 'components/add_users_to_team';
import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

import Menu from 'components/widgets/menu/menu.jsx';
import MenuGroup from 'components/widgets/menu/menu_group.jsx';
import MenuItemAction from 'components/widgets/menu/menu_items/menu_item_action.jsx';
import MenuItemExternalLink from 'components/widgets/menu/menu_items/menu_item_external_link.jsx';
import MenuItemLink from 'components/widgets/menu/menu_items/menu_item_link.jsx';
import MenuItemToggleModalRedux from 'components/widgets/menu/menu_items/menu_item_toggle_modal_redux.jsx';
import TeamGroupsManageModal from 'components/team_groups_manage_modal';

export default class MainMenu extends React.PureComponent {
    static propTypes = {
        mobile: PropTypes.bool.isRequired,
        id: PropTypes.string,
        teamId: PropTypes.string,
        teamType: PropTypes.string,
        teamName: PropTypes.string,
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

    toggleShortcutsModal = (e) => {
        e.preventDefault();
        GlobalActions.toggleShortcutsModal();
    }

    showGetTeamInviteLinkModal = (e) => {
        e.preventDefault();
        GlobalActions.showGetTeamInviteLinkModal();
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

        const pluginItems = this.props.pluginMenuItems.map((item) => {
            return (
                <MenuItemAction
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
                ariaLabel={localizeMessage('navbar_dropdown.menuAriaLabel', 'Main Menu')}
            >
                <MenuGroup>
                    <MenuItemAction
                        id='recentMentions'
                        show={this.props.mobile}
                        onClick={this.searchMentions}
                        icon={this.props.mobile && <i className='mentions'>{'@'}</i>}
                        text={localizeMessage('sidebar_right_menu.recentMentions', 'Recent Mentions')}
                    />
                    <MenuItemAction
                        id='flaggedPosts'
                        show={this.props.mobile}
                        onClick={this.getFlagged}
                        icon={this.props.mobile && <i className='fa fa-flag'/>}
                        text={localizeMessage('sidebar_right_menu.flagged', 'Flagged Posts')}
                    />
                </MenuGroup>
                <MenuGroup>
                    <MenuItemToggleModalRedux
                        id='accountSettings'
                        modalId={ModalIdentifiers.USER_SETTINGS}
                        dialogType={UserSettingsModal}
                        text={localizeMessage('navbar_dropdown.accountSettings', 'Account Settings')}
                        icon={this.props.mobile && <i className='fa fa-cog'/>}
                    />
                </MenuGroup>
                <MenuGroup>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                    >
                        <MenuItemToggleModalRedux
                            id='addGroupsToTeam'
                            show={teamIsGroupConstrained}
                            modalId={ModalIdentifiers.ADD_GROUPS_TO_TEAM}
                            dialogType={AddGroupsToTeamModal}
                            text={localizeMessage('navbar_dropdown.addGroupsToTeam', 'Add Groups to Team')}
                            icon={this.props.mobile && <i className='fa fa-user-plus'/>}
                        />
                    </TeamPermissionGate>
                </MenuGroup>
                <MenuGroup>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_USER_TO_TEAM]}
                    >
                        <TeamPermissionGate
                            teamId={this.props.teamId}
                            permissions={[Permissions.INVITE_USER]}
                        >
                            <MenuItemToggleModalRedux
                                id='sendEmailInvite'
                                show={this.props.enableEmailInvitations && !teamIsGroupConstrained}
                                modalId={ModalIdentifiers.EMAIL_INVITE}
                                dialogType={InviteMemberModal}
                                text={localizeMessage('navbar_dropdown.inviteMember', 'Send Email Invite')}
                                icon={this.props.mobile && <i className='fa fa-user-plus'/>}
                            />
                        </TeamPermissionGate>
                        <TeamPermissionGate
                            teamId={this.props.teamId}
                            permissions={[Permissions.INVITE_USER]}
                        >
                            <MenuItemAction
                                id='getTeamInviteLink'
                                show={this.props.teamType === Constants.OPEN_TEAM && this.props.enableUserCreation && !teamIsGroupConstrained}
                                onClick={this.showGetTeamInviteLinkModal}
                                text={localizeMessage('navbar_dropdown.teamLink', 'Get Team Invite Link')}
                                icon={this.props.mobile && <i className='fa fa-link'/>}
                            />
                        </TeamPermissionGate>
                        <MenuItemToggleModalRedux
                            id='addUsersToTeam'
                            show={!teamIsGroupConstrained}
                            modalId={ModalIdentifiers.ADD_USER_TO_TEAM}
                            dialogType={AddUsersToTeam}
                            text={localizeMessage('navbar_dropdown.addMemberToTeam', 'Add Members to Team')}
                            icon={this.props.mobile && <i className='fa fa-user-plus'/>}
                        />
                    </TeamPermissionGate>
                </MenuGroup>
                <MenuGroup>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                    >
                        <MenuItemToggleModalRedux
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
                        <MenuItemToggleModalRedux
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
                    <MenuItemToggleModalRedux
                        id='manageMembers'
                        modalId={ModalIdentifiers.TEAM_MEMBERS}
                        dialogType={TeamMembersModal}
                        text={localizeMessage('navbar_dropdown.manageMembers', 'Manage Members')}
                        icon={this.props.mobile && <i className='fa fa-users'/>}
                    />
                </MenuGroup>
                <MenuGroup>
                    <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                        <MenuItemLink
                            id='createTeam'
                            to='/create_team'
                            text={localizeMessage('navbar_dropdown.create', 'Create a New Team')}
                            icon={this.props.mobile && <i className='fa fa-plus-square'/>}
                        />
                    </SystemPermissionGate>
                    <MenuItemLink
                        id='joinTeam'
                        show={!this.props.experimentalPrimaryTeam && this.props.moreTeamsToJoin}
                        to='/select_team'
                        text={localizeMessage('navbar_dropdown.join', 'Join Another Team')}
                        icon={this.props.mobile && <i className='fa fa-plus-square'/>}
                    />
                    <MenuItemToggleModalRedux
                        id='leaveTeam'
                        modalId={ModalIdentifiers.LEAVE_TEAM}
                        dialogType={LeaveTeamModal}
                        text={localizeMessage('navbar_dropdown.leave', 'Leave Team')}
                        icon={this.props.mobile && <LeaveTeamIcon/>}
                    />
                </MenuGroup>
                <MenuGroup>
                    {pluginItems}
                </MenuGroup>
                <MenuGroup>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_SLASH_COMMANDS, Permissions.MANAGE_OAUTH, Permissions.MANAGE_INCOMING_WEBHOOKS, Permissions.MANAGE_OUTGOING_WEBHOOKS]}
                    >
                        <MenuItemLink
                            id='integrations'
                            show={!this.props.mobile && (this.props.enableIncomingWebhooks || this.props.enableOutgoingWebhooks || this.props.enableCommands || this.props.enableOAuthServiceProvider)}
                            to={'/' + this.props.teamName + '/integrations'}
                            text={localizeMessage('navbar_dropdown.integrations', 'Integrations')}
                        />
                    </TeamPermissionGate>
                    <MenuItemLink
                        id='customEmojis'
                        show={!this.props.mobile && this.props.enableCustomEmoji && this.props.canCreateOrDeleteCustomEmoji}
                        to={'/' + this.props.teamName + '/emoji'}
                        text={localizeMessage('navbar_dropdown.emoji', 'Custom Emoji')}
                    />
                </MenuGroup>
                <MenuGroup>
                    <SystemPermissionGate permissions={[Permissions.MANAGE_SYSTEM]}>
                        <MenuItemLink
                            id='systemConsole'
                            show={!this.props.mobile}
                            to='/admin_console'
                            text={localizeMessage('navbar_dropdown.console', 'System Console')}
                            icon={this.props.mobile && <i className='fa fa-wrench'/>}
                        />
                    </SystemPermissionGate>
                </MenuGroup>
                <MenuGroup>
                    <MenuItemExternalLink
                        id='helpLink'
                        show={Boolean(this.props.helpLink)}
                        url={this.props.helpLink}
                        text={localizeMessage('navbar_dropdown.help', 'Help')}
                        icon={this.props.mobile && <i className='fa fa-question'/>}
                    />
                    <MenuItemAction
                        id='keyboardShortcuts'
                        show={!this.props.mobile}
                        onClick={this.toggleShortcutsModal}
                        text={localizeMessage('navbar_dropdown.keyboardShortcuts', 'Keyboard Shortcuts')}
                    />
                    <MenuItemExternalLink
                        id='reportLink'
                        show={Boolean(this.props.reportAProblemLink)}
                        url={this.props.reportAProblemLink}
                        text={localizeMessage('navbar_dropdown.report', 'Report a Problem')}
                        icon={this.props.mobile && <i className='fa fa-phone'/>}
                    />
                    <MenuItemExternalLink
                        id='nativeAppLink'
                        show={this.props.appDownloadLink && !UserAgent.isMobileApp()}
                        url={useSafeUrl(this.props.appDownloadLink)}
                        text={localizeMessage('navbar_dropdown.nativeApps', 'Download Apps')}
                        icon={this.props.mobile && <i className='fa fa-mobile'/>}
                    />
                    <MenuItemToggleModalRedux
                        id='about'
                        modalId={ModalIdentifiers.ABOUT}
                        dialogType={AboutBuildModal}
                        text={localizeMessage('navbar_dropdown.about', 'About Mattermost')}
                        icon={this.props.mobile && <i className='fa fa-info'/>}
                    />
                </MenuGroup>
                <MenuGroup>
                    <MenuItemAction
                        id='logout'
                        onClick={this.handleEmitUserLoggedOutEvent}
                        text={localizeMessage('navbar_dropdown.logout', 'Logout')}
                        icon={this.props.mobile && <i className='fa fa-sign-out'/>}
                    />
                </MenuGroup>
            </Menu>
        );
    }
}
