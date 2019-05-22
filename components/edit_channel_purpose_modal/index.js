// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {patchChannel} from 'mattermost-redux/actions/channels';

import {getSendOnCtrlEnterPreferences} from 'selectors/preferences';

import EditChannelPurposeModal from './edit_channel_purpose_modal.jsx';

const mapStateToProps = createSelector(
    (state) => getSendOnCtrlEnterPreferences(state),
    ({requests}) => {
        const {channels: {updateChannel}} = requests;
        return {
            serverError: updateChannel.error,
            requestStatus: updateChannel.status,
        };
    },
    (ctrlSend, requestInfo) => ({ctrlSend, ...requestInfo})
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
)(EditChannelPurposeModal);

