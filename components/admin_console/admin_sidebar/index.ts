// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {PluginsResponse} from '@mattermost/types/plugins';

import {getPlugins} from 'mattermost-redux/actions/admin';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {isFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {isMobile} from 'utils/utils';

import {getNavigationBlocked} from 'selectors/views/admin';
import {getAdminDefinition, getConsoleAccess} from 'selectors/admin_console';

import {OnboardingTaskCategory, OnboardingTaskList} from 'components/onboarding_tasks';

import AdminSidebar from './admin_sidebar';

function mapStateToProps(state: GlobalState) {
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
    const subscriptionProduct = getSubscriptionProduct(state);

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
        subscriptionProduct,
    };
}

type Actions = {
    getPlugins: () => Promise<{data: PluginsResponse}>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getPlugins,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps, null, {pure: false});

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(AdminSidebar);
