// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannels} from 'mattermost-redux/actions/channels';

import MoreChannels from './more_channels.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannels,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(MoreChannels);
