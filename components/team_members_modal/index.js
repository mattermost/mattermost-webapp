// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import TeamMembersModal from './team_members_modal.jsx';

const mapStateToProps = (state) => ({
    currentTeam: getCurrentTeam(state)
});

export default connect(mapStateToProps)(TeamMembersModal);
