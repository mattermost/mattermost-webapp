// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GenericAction} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import {deferNavigation} from 'actions/admin_actions.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {getNavigationBlocked} from 'selectors/views/admin';

import AdminNavbarDropdown from './admin_navbar_dropdown';

function mapStateToProps(state: GlobalState) {
    return {
        locale: getCurrentLocale(state),
        teams: getMyTeams(state),
        siteName: getConfig(state).SiteName,
        navigationBlocked: getNavigationBlocked(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            deferNavigation,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminNavbarDropdown);
