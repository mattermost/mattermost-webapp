// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {leaveChannel} from 'actions/views/channel';

import LeavePrivateChannelModal from './leave_private_channel_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.LEAVE_PRIVATE_CHANNEL;
    const show = isModalOpen(state, modalId);
    return {
        show,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            leaveChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LeavePrivateChannelModal);
