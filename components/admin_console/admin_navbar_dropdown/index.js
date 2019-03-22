// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';

import {deferNavigation} from 'actions/admin_actions.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {getNavigationBlocked} from 'selectors/views/admin';

import AdminNavbarDropdown from './admin_navbar_dropdown.jsx';

function mapStateToProps(state) {
    const teams = getMyTeams(state);
    const redirectChannelPerTeam = {};
    for (const team of Object.values(teams)) {
        redirectChannelPerTeam[team.id] = getRedirectChannelNameForTeam(state, team.id);
    }

    return {
        locale: getCurrentLocale(state),
        teams,
        navigationBlocked: getNavigationBlocked(state),
        redirectChannelPerTeam,
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
