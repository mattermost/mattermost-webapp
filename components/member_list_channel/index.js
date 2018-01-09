// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannelStats} from 'mattermost-redux/actions/channels';

import MemberListChannel from './member_list_channel.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannelStats
        }, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(MemberListChannel);
