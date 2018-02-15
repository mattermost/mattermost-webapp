// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannels} from 'mattermost-redux/actions/channels';

import MoreChannels from './more_channels.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getChannels
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(MoreChannels);
