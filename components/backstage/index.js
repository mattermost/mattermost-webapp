// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import BackstageController from './backstage_controller.jsx';

function mapStateToProps(state) {
    const user = getCurrentUser(state);
    const team = getCurrentTeam(state);

    return {
        user,
        team
    };
}

export default withRouter(connect(mapStateToProps)(BackstageController));
