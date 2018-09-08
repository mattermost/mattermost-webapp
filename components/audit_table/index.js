// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getUser, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';

import AuditTable from './audit_table.jsx';

function mapStateToProps(state) {
    return {
        currentUser: getCurrentUser(state),
        getUser: (userId) => getUser(state, userId),
        getByName: (channelName) => getChannelByName(state, channelName),
    };
}

export default connect(mapStateToProps)(AuditTable);
