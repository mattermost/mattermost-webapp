// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {shouldShowTermsOfService, getCurrentUserId, isFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getFirstAdminSetupComplete} from 'mattermost-redux/actions/general';
import {getProfiles} from 'mattermost-redux/actions/users';

import {migrateRecentEmojis} from 'mattermost-redux/actions/emojis';

import {getShowLaunchingWorkspace} from 'selectors/onboarding';
import {emitBrowserWindowResized} from 'actions/views/browser';
import {loadConfigAndMe} from 'actions/views/root';

import {OnboardingTaskCategory, OnboardingTaskList} from 'components/onboarding_tasks';

import LocalStorageStore from 'stores/local_storage_store';
import {isMobile} from 'utils/utils';

import Root from './root.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);
    const plugins = state.plugins.components.CustomRouteComponent;
    const products = state.plugins.components.Product;

    const teamId = LocalStorageStore.getPreviousTeamId(getCurrentUserId(state));
    const permalinkRedirectTeam = getTeam(state, teamId);
    const taskListStatus = getBool(state, OnboardingTaskCategory, OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW);
    const isUserFirstAdmin = isFirstAdmin(state);
    const isMobileView = isMobile();
    const showTaskList = isUserFirstAdmin && taskListStatus && !isMobileView;

    return {
        theme: getTheme(state),
        telemetryEnabled: config.DiagnosticsEnabled === 'true',
        noAccounts: config.NoAccounts === 'true',
        telemetryId: config.DiagnosticId,
        permalinkRedirectTeamName: permalinkRedirectTeam ? permalinkRedirectTeam.name : '',
        showTermsOfService,
        plugins,
        products,
        showTaskList,
        showLaunchingWorkspace: getShowLaunchingWorkspace(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadConfigAndMe,
            emitBrowserWindowResized,
            getFirstAdminSetupComplete,
            getProfiles,
            migrateRecentEmojis,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
