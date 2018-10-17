// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import ChannelIdentifierRouter from './channel_identifier_router.jsx';

function mapStateToProps() {
    return {};
}

export default withRouter(connect(mapStateToProps)(ChannelIdentifierRouter));
