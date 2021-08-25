// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    getConfig,
    getFirstAdminVisitMarketplaceStatus,
    getLicense,
    getSubscriptionStats as selectSubscriptionStats,
} from 'mattermost-redux/selectors/entities/general';
import {
    getMyTeams,
    getJoinableTeamIds,
    getCurrentTeam,
} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {haveITeamPermission, haveICurrentTeamPermission, haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {getSubscriptionStats} from 'mattermost-redux/actions/cloud';
import {Permissions} from 'mattermost-redux/constants';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';

import {RHSStates, TrialPeriodDays} from 'utils/constants';
import {getRemainingDaysFromFutureTimestamp} from 'utils/utils.jsx';

import {unhideNextSteps} from 'actions/views/next_steps';
import {showMentions, showFlaggedPosts, closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {openModal} from 'actions/views/modals';
import {getRhsState} from 'selectors/rhs';
import {getGlobalHeaderEnabled} from 'selectors/global_header';

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
    const enablePluginMarketplace = config.PluginsEnabled === 'true' && config.EnableMarketplace === 'true';
    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const helpLink = config.HelpLink;
    const reportAProblemLink = config.ReportAProblemLink;

    let canCreateOrDeleteCustomEmoji = (haveISystemPermission(state, {permission: Permissions.CREATE_EMOJIS}) || haveISystemPermission(state, {permission: Permissions.DELETE_EMOJIS}));
    if (!canCreateOrDeleteCustomEmoji) {
        for (const team of getMyTeams(state)) {
            if (haveITeamPermission(state, team.id, Permissions.CREATE_EMOJIS) || haveITeamPermission(state, team.id, Permissions.DELETE_EMOJIS)) {
                canCreateOrDeleteCustomEmoji = true;

                break;
            }
        }
    }

    const canManageTeamIntegrations = (haveICurrentTeamPermission(state, Permissions.MANAGE_SLASH_COMMANDS) || haveICurrentTeamPermission(state, Permissions.MANAGE_OAUTH) || haveICurrentTeamPermission(state, Permissions.MANAGE_INCOMING_WEBHOOKS) || haveICurrentTeamPermission(state, Permissions.MANAGE_OUTGOING_WEBHOOKS));
    const canManageSystemBots = (haveISystemPermission(state, {permission: Permissions.MANAGE_BOTS}) || haveISystemPermission(state, {permission: Permissions.MANAGE_OTHERS_BOTS}));
    const canManageIntegrations = canManageTeamIntegrations || canManageSystemBots;

    const joinableTeams = getJoinableTeamIds(state);
    const moreTeamsToJoin = joinableTeams && joinableTeams.length > 0;
    const rhsState = getRhsState(state);
    const isCloud = getLicense(state).Cloud === 'true';
    const subscription = state.entities.cloud.subscription;
    const isFreeTrial = subscription?.is_free_trial === 'true';
    let daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription?.trial_end_at);
    if (daysLeftOnTrial > TrialPeriodDays.TRIAL_MAX_DAYS) {
        daysLeftOnTrial = TrialPeriodDays.TRIAL_MAX_DAYS;
    }

    return {
        appDownloadLink,
        enableCommands,
        enableCustomEmoji,
        canManageIntegrations,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
        canManageSystemBots,
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
        currentUser,
        isMentionSearch: rhsState === RHSStates.MENTION,
        teamIsGroupConstrained: Boolean(currentTeam.group_constrained),
        isLicensedForLDAPGroups:
            state.entities.general.license.LDAPGroups === 'true',
        showGettingStarted: showOnboarding(state),
        showNextStepsTips: showNextStepsTips(state),
        isFreeTrial,
        daysLeftOnTrial,
        showNextSteps: showNextSteps(state),
        isCloud,
        subscriptionStats: selectSubscriptionStats(state), // subscriptionStats are loaded in actions/views/root
        firstAdminVisitMarketplaceStatus: getFirstAdminVisitMarketplaceStatus(state),
        globalHeaderEnabled: getGlobalHeaderEnabled(state),
        prevTrialLicense: state.entities.admin.prevTrialLicense,
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
            getSubscriptionStats,
            getPrevTrialLicense,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainMenu);
