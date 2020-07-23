// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {checkIfTeamExists, createTeam} from 'mattermost-redux/actions/teams';

import TeamUrl from './team_url';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            checkIfTeamExists,
            createTeam,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(TeamUrl);
