// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getJoinableTeamIds} from 'mattermost-redux/selectors/entities/teams';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {showMentions, showFlaggedPosts, closeRightHandSide, openMenu as openRhsMenu, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {getRhsState, getIsRhsMenuOpen} from 'selectors/rhs';
import {RHSStates, Preferences, TutorialSteps} from 'utils/constants.jsx';
import {isMobile} from 'utils/utils.jsx';

import SidebarRightMenu from './sidebar_right_menu.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);
    const rhsState = getRhsState(state);

    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);

    const isLicensed = license.IsLicensed === 'true';
    const appDownloadLink = config.AppDownloadLink;
    const enableTeamCreation = config.EnableTeamCreation === 'true';
    const enableUserCreation = config.EnableUserCreation === 'true';
    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const helpLink = config.HelpLink;
    const reportAProblemLink = config.ReportAProblemLink;
    const restrictTeamInvite = config.RestrictTeamInvite;
    const siteName = config.SiteName;

    const joinableTeams = getJoinableTeamIds(state);
    const moreTeamsToJoin = joinableTeams && joinableTeams.length > 0;

    return {
        teamId: getCurrentTeamId(state),
        currentUserId: getCurrentUserId(state),
        isOpen: getIsRhsMenuOpen(state),
        isMentionSearch: rhsState === RHSStates.MENTION,
        showTutorialTip: enableTutorial && isMobile() && tutorialStep === TutorialSteps.MENU_POPOVER,
        isLicensed,
        appDownloadLink,
        enableTeamCreation,
        enableUserCreation,
        experimentalPrimaryTeam,
        helpLink,
        reportAProblemLink,
        restrictTeamInvite,
        siteName,
        moreTeamsToJoin,
        pluginMenuItems: state.plugins.components.MainMenu,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showMentions,
            showFlaggedPosts,
            closeRightHandSide,
            openRhsMenu,
            closeRhsMenu,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRightMenu);
