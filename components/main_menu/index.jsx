// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyTeams, getJoinableTeamIds, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {haveITeamPermission, haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import {RHSStates} from 'utils/constants';

import {showMentions, showFlaggedPosts, closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {openModal} from 'actions/views/modals';
import {getRhsState} from 'selectors/rhs';

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

    const joinableTeams = getJoinableTeamIds(state);
    const moreTeamsToJoin = joinableTeams && joinableTeams.length > 0;
    const rhsState = getRhsState(state);

    return {
        appDownloadLink,
        enableCommands,
        enableCustomEmoji,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
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
        isLicensedForLDAPGroups: state.entities.general.license.LDAPGroups === 'true',
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
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainMenu);
