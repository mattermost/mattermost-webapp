// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {shouldShowTermsOfService, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getFirstAdminSetupComplete} from 'mattermost-redux/actions/general';
import {getProfiles} from 'mattermost-redux/actions/users';
import {savePreferences} from 'mattermost-redux/actions/preferences';

import {getShowLaunchingWorkspace, getShowTaskListBool} from 'selectors/onboarding';
import {emitBrowserWindowResized} from 'actions/views/browser';
import {loadConfigAndMe, registerCustomPostRenderer} from 'actions/views/root';

import LocalStorageStore from 'stores/local_storage_store';

import Root from './root.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);
    const plugins = state.plugins.components.CustomRouteComponent;
    const products = state.plugins.components.Product;
    const userId = getCurrentUserId(state);

    const teamId = LocalStorageStore.getPreviousTeamId(userId);
    const permalinkRedirectTeam = getTeam(state, teamId);

    let showTaskList = false;
    let firstTimeOnboarding = false;

    // validation to avoid execute logic on first load which has no preferences values on global store, also check the enable onboarding config value
    if (Object.keys(state.entities.preferences.myPreferences).length > 0 && config.EnableOnboardingFlow === 'true') {
        [showTaskList, firstTimeOnboarding] = getShowTaskListBool(state);
    }

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
        firstTimeOnboarding,
        userId,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadConfigAndMe,
            emitBrowserWindowResized,
            getFirstAdminSetupComplete,
            getProfiles,
            savePreferences,
            registerCustomPostRenderer,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
