// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getPlugins} from 'mattermost-redux/actions/admin';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {isFirstAdmin} from 'mattermost-redux/selectors/entities/users';

import {isMobile} from 'utils/utils.jsx';

import {OnboardingTaskCategory, OnboardingTaskList} from 'components/onboarding_tasks';

import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {getNavigationBlocked} from 'selectors/views/admin';
import {getAdminDefinition, getConsoleAccess} from 'selectors/admin_console';

import AdminSidebar from './admin_sidebar.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);
    const buildEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const siteName = config.SiteName;
    const adminDefinition = getAdminDefinition(state);
    const consoleAccess = getConsoleAccess(state);
    const taskListStatus = getBool(state, OnboardingTaskCategory, OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW);
    const isUserFirstAdmin = isFirstAdmin(state);
    const isMobileView = isMobile();
    const showTaskList = isUserFirstAdmin && taskListStatus && !isMobileView;

    return {
        license,
        config: state.entities.admin.config,
        plugins: state.entities.admin.plugins,
        navigationBlocked: getNavigationBlocked(state),
        buildEnterpriseReady,
        siteName,
        adminDefinition,
        consoleAccess,
        cloud: state.entities.cloud,
        showTaskList,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPlugins,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {pure: false})(AdminSidebar);
