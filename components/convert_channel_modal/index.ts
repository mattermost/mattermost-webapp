// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {updateChannelPrivacy} from 'mattermost-redux/actions/channels';

import ConvertChannelModal from './convert_channel_modal';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            updateChannelPrivacy,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(ConvertChannelModal);
