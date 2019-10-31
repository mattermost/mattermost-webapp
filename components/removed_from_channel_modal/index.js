// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import RemovedFromChannelModal from './removed_from_channel_modal';

function mapStateToProps(state) {
    return {
        currentUserId: getCurrentUserId(state),
    };
}

export default connect(mapStateToProps)(RemovedFromChannelModal);
