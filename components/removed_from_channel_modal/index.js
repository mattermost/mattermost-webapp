// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';

import {closeModal} from 'actions/views/modals';

import RemovedFromChannelModal from './removed_from_channel_modal';

function mapStateToProps(state) {
    return {
        currentUser: getCurrentUser(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemovedFromChannelModal);
