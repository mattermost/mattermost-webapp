// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

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
    const enableOnlyAdminIntegrations = config.EnableOnlyAdminIntegrations === 'true';
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enableTeamCreation = config.EnableTeamCreation === 'true';
    const enableUserCreation = config.EnableUserCreation === 'true';
    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const helpLink = config.HelpLink;
    const reportAProblemLink = config.ReportAProblemLink;
    const restrictTeamInvite = config.RestrictTeamInvite;

    return {
        isLicensed,
        appDownloadLink,
        enableCommands,
        enableCustomEmoji,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOnlyAdminIntegrations,
        enableOutgoingWebhooks,
        enableTeamCreation,
        enableUserCreation,
        experimentalPrimaryTeam,
        helpLink,
        reportAProblemLink,
        restrictTeamInvite,
        pluginMenuItems: state.plugins.mainMenuActions,
    };
}

export default connect(mapStateToProps)(SidebarHeaderDropdown);
