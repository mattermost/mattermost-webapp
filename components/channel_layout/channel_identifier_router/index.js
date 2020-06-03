// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {onChannelByIdentifierEnter} from './actions';

import ChannelIdentifierRouter from './channel_identifier_router.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            onChannelByIdentifierEnter,
        }, dispatch),
    };
}

export default withRouter(connect(null, mapDispatchToProps)(ChannelIdentifierRouter));
