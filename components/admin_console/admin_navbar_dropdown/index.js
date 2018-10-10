// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMyTeams} from 'mattermost-redux/selectors/entities/teams';

import {deferNavigation} from 'actions/admin_actions.jsx';
import {getNavigationBlocked} from 'selectors/views/admin';

import AdminNavbarDropdown from './admin_navbar_dropdown.jsx';

function mapStateToProps(state) {
    return {
        teams: getMyTeams(state),
        navigationBlocked: getNavigationBlocked(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deferNavigation,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminNavbarDropdown);
