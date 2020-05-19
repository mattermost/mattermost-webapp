// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {unarchiveChannel} from 'mattermost-redux/actions/channels';

import UnarchiveChannelModal from './unarchive_channel_modal.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            unarchiveChannel,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(UnarchiveChannelModal);
