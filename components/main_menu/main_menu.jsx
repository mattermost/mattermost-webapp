// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl} from 'react-intl';
import {Permissions} from 'mattermost-redux/constants';

import * as GlobalActions from 'actions/global_actions';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {intlShape} from 'utils/react_intl';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';
import {useSafeUrl} from 'utils/url';
import * as UserAgent from 'utils/user_agent';
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
import MarketplaceModal from 'components/plugin_marketplace';

import Menu from 'components/widgets/menu/menu';
import TeamGroupsManageModal from 'components/team_groups_manage_modal';

import withGetCloudSubscription from '../common/hocs/cloud/with_get_cloud_subcription';

class MainMenu extends React.PureComponent {
    static propTypes = {
        mobile: PropTypes.bool.isRequired,
        id: PropTypes.string,
        teamId: PropTypes.string,
        teamName: PropTypes.string,
        siteName: PropTypes.string,
        currentUser: PropTypes.object,
        appDownloadLink: PropTypes.string,
        enableCommands: PropTypes.bool.isRequired,
        enableCustomEmoji: PropTypes.bool.isRequired,
        enableIncomingWebhooks: PropTypes.bool.isRequired,
        enableOAuthServiceProvider: PropTypes.bool.isRequired,
        enableOutgoingWebhooks: PropTypes.bool.isRequired,
        canManageSystemBots: PropTypes.bool.isRequired,
        canCreateOrDeleteCustomEmoji: PropTypes.bool.isRequired,
        canManageIntegrations: PropTypes.bool.isRequired,
        enablePluginMarketplace: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        helpLink: PropTypes.string,
        reportAProblemLink: PropTypes.string,
        moreTeamsToJoin: PropTypes.bool.isRequired,
        pluginMenuItems: PropTypes.arrayOf(PropTypes.object),
        isMentionSearch: PropTypes.bool,
        teamIsGroupConstrained: PropTypes.bool.isRequired,
        isLicensedForLDAPGroups: PropTypes.bool,
        showGettingStarted: PropTypes.bool.isRequired,
        intl: intlShape.isRequired,
        showNextStepsTips: PropTypes.bool,
        isCloud: PropTypes.bool,
        subscriptionStats: PropTypes.object,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequred,
            showMentions: PropTypes.func,
            showFlaggedPosts: PropTypes.func,
            closeRightHandSide: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
            unhideNextSteps: PropTypes.func.isRequired,
            getSubscriptionStats: PropTypes.func.isRequired,
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

    async componentDidMount() {
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

    shouldShowUpgradeModal = () => {
        const {subscriptionStats, isCloud} = this.props;

        if (subscriptionStats?.is_paid_tier === 'true') { // eslint-disable-line camelcase
            return false;
        }
        return isCloud && subscriptionStats?.remaining_seats <= 0;
    }

    render() {
        const {currentUser, teamIsGroupConstrained, isLicensedForLDAPGroups} = this.props;

        if (!currentUser) {
            return null;
        }

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

        const someIntegrationEnabled = this.props.enableIncomingWebhooks || this.props.enableOutgoingWebhooks || this.props.enableCommands || this.props.enableOAuthServiceProvider || this.props.canManageSystemBots;
        const showIntegrations = !this.props.mobile && someIntegrationEnabled && this.props.canManageIntegrations;

        const {formatMessage} = this.props.intl;

        const invitePeopleModal = (
            <Menu.ItemToggleModalRedux
                id='invitePeople'
                modalId={ModalIdentifiers.INVITATION}
                dialogType={InvitationModal}
                text={formatMessage({
                    id: 'navbar_dropdown.invitePeople',
                    defaultMessage: 'Invite People',
                })}
                extraText={formatMessage({
                    id: 'navbar_dropdown.invitePeopleExtraText',
                    defaultMessage: 'Add or invite people to the team',
                })}
                icon={this.props.mobile && <i className='fa fa-user-plus'/>}
            />
        );

        return (
            <Menu
                mobile={this.props.mobile}
                id={this.props.id}
                ariaLabel={formatMessage({id: 'navbar_dropdown.menuAriaLabel', defaultMessage: 'main menu'})}
            >
                <Menu.Group>
                    <Menu.ItemAction
                        id='recentMentions'
                        show={this.props.mobile}
                        onClick={this.searchMentions}
                        icon={this.props.mobile && <i className='mentions'>{'@'}</i>}
                        text={formatMessage({id: 'sidebar_right_menu.recentMentions', defaultMessage: 'Recent Mentions'})}
                    />
                    <Menu.ItemAction
                        id='flaggedPosts'
                        show={this.props.mobile}
                        onClick={this.getFlagged}
                        icon={this.props.mobile && <i className='fa fa-bookmark'/>}
                        text={formatMessage({id: 'sidebar_right_menu.flagged', defaultMessage: 'Saved Posts'})}
                    />
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemToggleModalRedux
                        id='accountSettings'
                        modalId={ModalIdentifiers.USER_SETTINGS}
                        dialogType={UserSettingsModal}
                        text={formatMessage({id: 'navbar_dropdown.accountSettings', defaultMessage: 'Account Settings'})}
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
                            show={teamIsGroupConstrained && isLicensedForLDAPGroups}
                            modalId={ModalIdentifiers.ADD_GROUPS_TO_TEAM}
                            dialogType={AddGroupsToTeamModal}
                            text={formatMessage({id: 'navbar_dropdown.addGroupsToTeam', defaultMessage: 'Add Groups to Team'})}
                            icon={this.props.mobile && <i className='fa fa-user-plus'/>}
                        />
                    </TeamPermissionGate>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_USER_TO_TEAM, Permissions.INVITE_GUEST]}
                    >
                        {invitePeopleModal}
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
                            text={formatMessage({id: 'navbar_dropdown.teamSettings', defaultMessage: 'Team Settings'})}
                            icon={this.props.mobile && <i className='fa fa-globe'/>}
                        />
                    </TeamPermissionGate>
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_TEAM]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='manageGroups'
                            show={teamIsGroupConstrained && isLicensedForLDAPGroups}
                            modalId={ModalIdentifiers.MANAGE_TEAM_GROUPS}
                            dialogProps={{
                                teamID: this.props.teamId,
                            }}
                            dialogType={TeamGroupsManageModal}
                            text={formatMessage({id: 'navbar_dropdown.manageGroups', defaultMessage: 'Manage Groups'})}
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
                            text={formatMessage({id: 'navbar_dropdown.manageMembers', defaultMessage: 'Manage Members'})}
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
                            text={formatMessage({id: 'navbar_dropdown.viewMembers', defaultMessage: 'View Members'})}
                            icon={this.props.mobile && <i className='fa fa-users'/>}
                        />
                    </TeamPermissionGate>
                </Menu.Group>
                <Menu.Group>
                    <SystemPermissionGate permissions={[Permissions.CREATE_TEAM]}>
                        <Menu.ItemLink
                            id='createTeam'
                            to='/create_team'
                            text={formatMessage({id: 'navbar_dropdown.create', defaultMessage: 'Create a Team'})}
                            icon={this.props.mobile && <i className='fa fa-plus-square'/>}
                        />
                    </SystemPermissionGate>
                    <Menu.ItemLink
                        id='joinTeam'
                        show={!this.props.experimentalPrimaryTeam && this.props.moreTeamsToJoin}
                        to='/select_team'
                        text={formatMessage({id: 'navbar_dropdown.join', defaultMessage: 'Join Another Team'})}
                        icon={this.props.mobile && <i className='fa fa-plus-square'/>}
                    />
                    <Menu.ItemToggleModalRedux
                        id='leaveTeam'
                        show={!teamIsGroupConstrained && this.props.experimentalPrimaryTeam !== this.props.teamName}
                        modalId={ModalIdentifiers.LEAVE_TEAM}
                        dialogType={LeaveTeamModal}
                        text={formatMessage({id: 'navbar_dropdown.leave', defaultMessage: 'Leave Team'})}
                        icon={this.props.mobile && <LeaveTeamIcon/>}
                    />
                </Menu.Group>
                <Menu.Group>
                    {pluginItems}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemLink
                        id='integrations'
                        show={showIntegrations}
                        to={'/' + this.props.teamName + '/integrations'}
                        text={formatMessage({id: 'navbar_dropdown.integrations', defaultMessage: 'Integrations'})}
                    />
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.MANAGE_SYSTEM]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='marketplaceModal'
                            modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                            show={!this.props.mobile && this.props.enablePluginMarketplace}
                            dialogType={MarketplaceModal}
                            text={formatMessage({id: 'navbar_dropdown.marketplace', defaultMessage: 'Plugin Marketplace'})}
                        />
                    </TeamPermissionGate>
                    <Menu.ItemLink
                        id='customEmojis'
                        show={!this.props.mobile && this.props.enableCustomEmoji && this.props.canCreateOrDeleteCustomEmoji}
                        to={'/' + this.props.teamName + '/emoji'}
                        text={formatMessage({id: 'navbar_dropdown.emoji', defaultMessage: 'Custom Emoji'})}
                    />
                </Menu.Group>
                <Menu.Group>
                    <SystemPermissionGate permissions={Permissions.SYSCONSOLE_READ_PERMISSIONS}>
                        <Menu.ItemLink
                            id='systemConsole'
                            show={!this.props.mobile}
                            to='/admin_console'
                            text={formatMessage({id: 'navbar_dropdown.console', defaultMessage: 'System Console'})}
                            icon={this.props.mobile && <i className='fa fa-wrench'/>}
                        />
                    </SystemPermissionGate>
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemExternalLink
                        id='helpLink'
                        show={Boolean(this.props.helpLink)}
                        url={this.props.helpLink}
                        text={formatMessage({id: 'navbar_dropdown.help', defaultMessage: 'Help'})}
                        icon={this.props.mobile && <i className='fa fa-question'/>}
                    />
                    <Menu.ItemAction
                        id='gettingStarted'
                        show={this.props.showGettingStarted}
                        onClick={() => this.props.actions.unhideNextSteps()}
                        text={formatMessage({id: this.props.showNextStepsTips ? 'sidebar_next_steps.tipsAndNextSteps' : 'navbar_dropdown.gettingStarted', defaultMessage: this.props.showNextStepsTips ? 'Tips & Next Steps' : 'Getting Started'})}
                    />
                    <Menu.ItemAction
                        id='keyboardShortcuts'
                        show={!this.props.mobile}
                        onClick={this.toggleShortcutsModal}
                        text={formatMessage({id: 'navbar_dropdown.keyboardShortcuts', defaultMessage: 'Keyboard Shortcuts'})}
                    />
                    <Menu.ItemExternalLink
                        id='reportLink'
                        show={Boolean(this.props.reportAProblemLink)}
                        url={this.props.reportAProblemLink}
                        text={formatMessage({id: 'navbar_dropdown.report', defaultMessage: 'Report a Problem'})}
                        icon={this.props.mobile && <i className='fa fa-phone'/>}
                    />
                    <Menu.ItemExternalLink
                        id='nativeAppLink'
                        show={this.props.appDownloadLink && !UserAgent.isMobileApp()}
                        url={useSafeUrl(this.props.appDownloadLink)}
                        text={formatMessage({id: 'navbar_dropdown.nativeApps', defaultMessage: 'Download Apps'})}
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
                        text={formatMessage({id: 'navbar_dropdown.logout', defaultMessage: 'Log Out'})}
                        icon={this.props.mobile && <i className='fa fa-sign-out'/>}
                    />
                </Menu.Group>
            </Menu>
        );
    }
}

export default injectIntl(withGetCloudSubscription((MainMenu)));
