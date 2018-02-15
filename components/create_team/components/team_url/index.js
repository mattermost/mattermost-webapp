// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {checkIfTeamExists, createTeam} from 'mattermost-redux/actions/teams';

import TeamUrl from './team_url';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            checkIfTeamExists: bindActionCreators(checkIfTeamExists, dispatch),
            createTeam: bindActionCreators(createTeam, dispatch)
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamUrl);
