// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {goToLastViewedChannel} from 'actions/views/channel';

import CloseChannel from './close_channel';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        goToLastViewedChannel,
    }, dispatch),
});

export default connect(null, mapDispatchToProps)(CloseChannel);
