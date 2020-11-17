// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getTeamStats as loadTeamStats} from 'mattermost-redux/actions/teams';

import {getTeamStats} from 'mattermost-redux/selectors/entities/teams';

import TeamInList from './team_in_list.jsx';

function mapStateToProps(state) {
    return {
        stats: getTeamStats(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadTeamStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamInList);
