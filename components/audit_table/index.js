// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {getUser, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';

import {getDirectTeammate} from 'utils/utils.jsx';

import AuditTable from './audit_table.jsx';

function mapStateToProps(state) {
    return {
        currentUser: getCurrentUser(state),
        getUser: (userId) => getUser(state, userId),
        getByName: (channelName) => getChannelByName(state, channelName),
        getDirectTeammate: (channelId) => getDirectTeammate(state, channelId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getMissingProfilesByIds,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuditTable);
