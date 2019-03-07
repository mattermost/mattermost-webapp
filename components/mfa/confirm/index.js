// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {loadMe} from 'mattermost-redux/actions/users';
import {getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';

import {isEmptyObject} from 'utils/utils';

import Confirm from './confirm.jsx';

function mapStateToProps(state) {
    return {

        // Assume we need to load the user if they don't have any team memberships loaded
        shouldLoadUser: isEmptyObject(getTeamMemberships(state)),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadMe,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Confirm);
