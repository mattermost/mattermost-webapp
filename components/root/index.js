// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {shouldShowTermsOfService, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';

import {loadMeAndConfig} from 'actions/views/root';
import {emitBrowserWindowResized} from 'actions/views/browser';
import {isFirstAdmin} from 'components/next_steps_view/steps';
import LocalStorageStore from 'stores/local_storage_store';
import {Preferences} from 'utils/constants';
import {isMobile} from 'utils/utils.jsx';

import Root from './root.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);
    const plugins = state.plugins.components.CustomRouteComponent;
    const products = state.plugins.components.Product;

    const teamId = LocalStorageStore.getPreviousTeamId(getCurrentUserId(state));
    const permalinkRedirectTeam = getTeam(state, teamId);
    const currentUserId = getCurrentUserId(state);
    const dismissChecklist = getBool(state, Preferences.DISMISS_ONBOARDING_CHECKLIST, currentUserId);
    const isUserFirstAdmin = isFirstAdmin(state);

    return {
        theme: getTheme(state),
        telemetryEnabled: config.DiagnosticsEnabled === 'true',
        noAccounts: config.NoAccounts === 'true',
        telemetryId: config.DiagnosticId,
        permalinkRedirectTeamName: permalinkRedirectTeam ? permalinkRedirectTeam.name : '',
        showTermsOfService,
        plugins,
        products,
        dismissChecklist,
        isUserFirstAdmin,
        isMobile: isMobile(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadMeAndConfig,
            emitBrowserWindowResized,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
