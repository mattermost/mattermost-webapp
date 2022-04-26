// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {shouldShowTermsOfService, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getTheme, getBool, makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getFirstAdminSetupComplete} from 'mattermost-redux/actions/general';
import {getProfiles} from 'mattermost-redux/actions/users';
import {savePreferences} from 'mattermost-redux/actions/preferences';

import {getShowLaunchingWorkspace, showOnboardingTaskListToExistingUsers} from 'selectors/onboarding';
import {emitBrowserWindowResized} from 'actions/views/browser';
import {loadConfigAndMe} from 'actions/views/root';

import {RecommendedNextSteps, Preferences} from 'utils/constants';

import {OnboardingTaskCategory, OnboardingTaskList} from 'components/onboarding_tasks';

import LocalStorageStore from 'stores/local_storage_store';
import {isMobile} from 'utils/utils.jsx';

import Root from './root.jsx';

function mapStateToProps(state) {
    const getCategory = makeGetCategory();
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);
    const plugins = state.plugins.components.CustomRouteComponent;
    const products = state.plugins.components.Product;
    const userId = getCurrentUserId(state);

    const teamId = LocalStorageStore.getPreviousTeamId(userId);
    const permalinkRedirectTeam = getTeam(state, teamId);

    let showTaskList = false;
    let firstTimeOnboarding = false;

    // validation to avoid execute logic on first load which has no preferences values on global store
    if (Object.keys(state.entities.preferences.myPreferences).length > 0) {
        // conditions to validate scenario where users (initially first_admins) had already set any of the onboarding task list preferences values.
        // We check wether the preference value exists meaning the onboarding tasks list already started no matter what the state of the process is
        const onboardingPreferences = getCategory(state, OnboardingTaskCategory);
        const hasUserStartedOnboardingTaskListProcess = onboardingPreferences?.some((pref) =>
            pref.name === OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW || pref.name === OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN);

        // This condition verifies existing users hasn't finished nor skipped legacy next steps or there are still steps not completed
        const legacyStepsPreferences = getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS);
        const hasLegacyNextStepsPrefs = legacyStepsPreferences?.some((pref) =>
            pref.name === RecommendedNextSteps.SKIP || pref.name === RecommendedNextSteps.HIDE);

        const existingUserHasntFinishedNorSkippedLegacyNextSteps = hasLegacyNextStepsPrefs && showOnboardingTaskListToExistingUsers(state);

        const completelyNewUserForOnboarding = !hasUserStartedOnboardingTaskListProcess && !hasLegacyNextStepsPrefs;

        if (completelyNewUserForOnboarding || existingUserHasntFinishedNorSkippedLegacyNextSteps) {
            firstTimeOnboarding = true;
        }

        const taskListStatus = getBool(state, OnboardingTaskCategory, OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW);
        const isMobileView = isMobile();
        showTaskList = (firstTimeOnboarding || taskListStatus) && !isMobileView;
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
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
