// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import Constants from 'utils/constants.jsx';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {patchChannel} from 'mattermost-redux/actions/channels';

import EditChannelHeaderModal from './edit_channel_header_modal.jsx';

const mapStateToProps = createSelector(
    (state) => getBool(state, Constants.Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
    ({requests}) => {
        const {channels: {updateChannel}} = requests;
        return {
            serverError: updateChannel.error,
            requestStatus: updateChannel.status
        };
    },
    (ctrlSend, submitInfo) => ({
        ctrlSend,
        ...submitInfo,
    }),
);

export default connect(
    mapStateToProps,
    {
        onPatchChannel: patchChannel
    }
)(EditChannelHeaderModal);
