// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId, getUser} from 'mattermost-redux/selectors/entities/users';

import RemovedFromChannelModal from './removed_from_channel_modal';

function mapStateToProps(state, ownProps) {
    const remover = getUser(state, ownProps.removerId);
    return {
        currentUserId: getCurrentUserId(state),
        remover: remover && remover.username,
    };
}

export default connect(mapStateToProps)(RemovedFromChannelModal);
