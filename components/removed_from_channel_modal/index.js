// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {goToLastViewedChannel} from 'actions/views/channel';

import RemovedFromChannelModal from './removed_from_channel_modal';

function mapStateToProps(state) {
    return {
        currentUserId: getCurrentUserId(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            goToLastViewedChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemovedFromChannelModal);
