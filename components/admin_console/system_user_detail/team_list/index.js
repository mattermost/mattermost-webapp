// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getTeamsForUser, getTeamMembersForUser} from 'mattermost-redux/actions/teams';

import {getCurrentLocale} from 'selectors/i18n';
import {t} from 'utils/i18n';

import TeamList from './team_list.jsx';

function mapStateToProps(state) {
    return {
        emptyListTextId: t('admin.team_settings.team_list.no_teams_found'),
        emptyListTextDefaultMessage: 'No teams found',
        locale: getCurrentLocale(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeamsData: getTeamsForUser,
            getTeamMembersForUser,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamList);