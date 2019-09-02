// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getGroupsAssociatedToChannel, unlinkGroupSyncable} from 'mattermost-redux/actions/groups';

import {closeModal, openModal} from 'actions/views/modals';

import ChannelGroupsManageModal from './channel_groups_manage_modal';

const mapStateToProps = (state, ownProps) => {
    return {
        channel: state.entities.channels.channels[ownProps.channelID],
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getGroupsAssociatedToChannel,
        closeModal,
        openModal,
        unlinkGroupSyncable,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelGroupsManageModal);
