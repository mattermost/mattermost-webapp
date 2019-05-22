// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {patchChannel} from 'mattermost-redux/actions/channels';

import {getSendOnCtrlEnterPreferences} from 'selectors/preferences';

import EditChannelHeaderModal from './edit_channel_header_modal.jsx';

const mapStateToProps = createSelector(
    (state) => getSendOnCtrlEnterPreferences(state),
    ({requests}) => {
        const {channels: {updateChannel}} = requests;
        return {
            serverError: updateChannel.error,
            requestStatus: updateChannel.status,
        };
    },
    (ctrlSend, submitInfo) => ({
        ctrlSend,
        ...submitInfo,
    }),
);

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            patchChannel: bindActionCreators(patchChannel, dispatch),
        },
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(EditChannelHeaderModal);
