// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getMyTeams, getJoinableTeamIds} from 'mattermost-redux/selectors/entities/teams';
import {haveITeamPermission, haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import {openModal} from 'actions/views/modals';

import SidebarHeaderDropdown from './sidebar_header_dropdown.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);

    const isLicensed = license.IsLicensed === 'true';

    const appDownloadLink = config.AppDownloadLink;
    const enableCommands = config.EnableCommands === 'true';
    const enableCustomEmoji = config.EnableCustomEmoji === 'true';
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enableUserCreation = config.EnableUserCreation === 'true';
    const enableEmailInvitations = config.EnableEmailInvitations === 'true';
    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const helpLink = config.HelpLink;
    const reportAProblemLink = config.ReportAProblemLink;

    let canCreateCustomEmoji = haveISystemPermission(state, {permission: Permissions.MANAGE_EMOJIS});
    if (!canCreateCustomEmoji) {
        for (const team of getMyTeams(state)) {
            if (haveITeamPermission(state, {team: team.id, permission: Permissions.MANAGE_EMOJIS})) {
                canCreateCustomEmoji = true;
                break;
            }
        }
    }

    const joinableTeams = getJoinableTeamIds(state);
    const moreTeamsToJoin = joinableTeams && joinableTeams.length > 0;

    return {
        isLicensed,
        appDownloadLink,
        enableCommands,
        enableCustomEmoji,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
        enableUserCreation,
        enableEmailInvitations,
        experimentalPrimaryTeam,
        helpLink,
        reportAProblemLink,
        pluginMenuItems: state.plugins.components.MainMenu,
        canCreateCustomEmoji,
        moreTeamsToJoin,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarHeaderDropdown);
