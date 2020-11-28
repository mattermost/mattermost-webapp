// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    getConfig,
    getLicense,
} from 'mattermost-redux/selectors/entities/general';
import {
    getMyTeams,
    getJoinableTeamIds,
    getCurrentTeam,
    getMyTeamMember,
} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {haveITeamPermission, haveICurrentTeamPermission, haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getCloudSubscription} from 'mattermost-redux/actions/cloud';

import {isAdmin} from 'utils/utils.jsx';

import {RHSStates} from 'utils/constants';

import {unhideNextSteps} from 'actions/views/next_steps';
import {showMentions, showFlaggedPosts, closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {openModal} from 'actions/views/modals';
import {getRhsState} from 'selectors/rhs';

import {
    showOnboarding,
    showNextStepsTips,
    showNextSteps,
} from 'components/next_steps_view/steps';

import MainMenu from './main_menu.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentTeam = getCurrentTeam(state);
    const currentUser = getCurrentUser(state);

    const appDownloadLink = config.AppDownloadLink;
    const enableCommands = config.EnableCommands === 'true';
    const enableCustomEmoji = config.EnableCustomEmoji === 'true';
    const siteName = config.SiteName;
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enableUserCreation = config.EnableUserCreation === 'true';
    const enableEmailInvitations = config.EnableEmailInvitations === 'true';
    const enablePluginMarketplace = config.PluginsEnabled === 'true' && config.EnableMarketplace === 'true';
    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const helpLink = config.HelpLink;
    const reportAProblemLink = config.ReportAProblemLink;

    let canCreateOrDeleteCustomEmoji = (haveISystemPermission(state, {permission: Permissions.CREATE_EMOJIS}) || haveISystemPermission(state, {permission: Permissions.DELETE_EMOJIS}));
    if (!canCreateOrDeleteCustomEmoji) {
        for (const team of getMyTeams(state)) {
            if (haveITeamPermission(state, {team: team.id, permission: Permissions.CREATE_EMOJIS}) || haveITeamPermission(state, {team: team.id, permission: Permissions.DELETE_EMOJIS})) {
                canCreateOrDeleteCustomEmoji = true;

                break;
            }
        }
    }

    const canManageTeamIntegrations = (haveICurrentTeamPermission(state, {permission: Permissions.MANAGE_SLASH_COMMANDS}) || haveICurrentTeamPermission(state, {permission: Permissions.MANAGE_OAUTH}) || haveICurrentTeamPermission(state, {permission: Permissions.MANAGE_INCOMING_WEBHOOKS}) || haveICurrentTeamPermission(state, {permission: Permissions.MANAGE_OUTGOING_WEBHOOKS}));
    const canManageSystemBots = (haveISystemPermission(state, {permission: Permissions.MANAGE_BOTS}) || haveISystemPermission(state, {permission: Permissions.MANAGE_OTHERS_BOTS}));
    const canManageIntegrations = canManageTeamIntegrations || canManageSystemBots;

    const joinableTeams = getJoinableTeamIds(state);
    const moreTeamsToJoin = joinableTeams && joinableTeams.length > 0;
    const rhsState = getRhsState(state);

    return {
        appDownloadLink,
        enableCommands,
        enableCustomEmoji,
        canManageIntegrations,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
        canManageSystemBots,
        enableUserCreation,
        enableEmailInvitations,
        enablePluginMarketplace,
        experimentalPrimaryTeam,
        helpLink,
        reportAProblemLink,
        pluginMenuItems: state.plugins.components.MainMenu,
        canCreateOrDeleteCustomEmoji,
        moreTeamsToJoin,
        siteName,
        teamId: currentTeam.id,
        teamName: currentTeam.name,
        teamType: currentTeam.type,
        currentUser,
        isMentionSearch: rhsState === RHSStates.MENTION,
        teamIsGroupConstrained: Boolean(currentTeam.group_constrained),
        isLicensedForLDAPGroups:
            state.entities.general.license.LDAPGroups === 'true',
        userLimit: getConfig(state).ExperimentalCloudUserLimit,
        currentUsers: state.entities.admin.analytics.TOTAL_USERS,
        userIsAdmin: isAdmin(getMyTeamMember(state, currentTeam.id).roles),
        showGettingStarted: showOnboarding(state),
        showNextStepsTips: showNextStepsTips(state),
        showNextSteps: showNextSteps(state),
        subscription: state.entities.cloud.subscription,
        isCloud: getLicense(state).Cloud === 'true',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            showMentions,
            showFlaggedPosts,
            closeRightHandSide,
            closeRhsMenu,
            unhideNextSteps,
            getCloudSubscription,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainMenu);
