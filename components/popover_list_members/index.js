// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getProfilesInChannel} from 'mattermost-redux/actions/users';
import {getUserStatuses} from 'mattermost-redux/selectors/entities/users';

import PopoverListMembers from './popover_list_members.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        statuses: getUserStatuses(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfilesInChannel
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PopoverListMembers);
