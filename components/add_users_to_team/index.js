// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getProfilesNotInTeam} from 'mattermost-redux/actions/users';

import AddUsersToTeam from './add_users_to_team.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getProfilesNotInTeam
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(AddUsersToTeam);
