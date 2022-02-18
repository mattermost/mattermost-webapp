// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig, getFirstAdminSetupComplete as getFirstAdminSetupCompleteSelector} from 'mattermost-redux/selectors/entities/general';
import {shouldShowTermsOfService, getCurrentUserId, isFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getFirstAdminSetupComplete} from 'mattermost-redux/actions/general';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';

import {loadMeAndConfig} from 'actions/views/root';
import {emitBrowserWindowResized} from 'actions/views/browser';
import {OnboardingTaskCategory, OnboardingTaskList} from 'components/onboarding_tasks';
import LocalStorageStore from 'stores/local_storage_store';
import {isMobile} from 'utils/utils.jsx';
import {getFirstChannelNameViews} from 'selectors/onboarding';

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

    // Only intended to be true on first page load directly following completion of first admin setup.
    const showSetupTransitioning = isUserFirstAdmin && Boolean(getFirstChannelNameViews(state)) && getFirstAdminSetupCompleteSelector(state);

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
        showSetupTransitioning,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadMeAndConfig,
            emitBrowserWindowResized,
            getFirstAdminSetupComplete,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
