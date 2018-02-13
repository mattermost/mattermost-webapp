// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams} from 'mattermost-redux/actions/teams';
import {withRouter} from 'react-router-dom';

import TeamSidebar from './team_sidebar_controller.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getTeams
    }, dispatch)
});

export default withRouter(connect(null, mapDispatchToProps)(TeamSidebar));
