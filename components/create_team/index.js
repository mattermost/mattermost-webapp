// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import CreateTeam from './create_team';

function mapStateToProps(state) {
    return {
        currentChannel: getCurrentChannel(state),
        currentTeam: getCurrentTeam(state)
    };
}

export default connect(mapStateToProps)(CreateTeam);
