// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPenultimateViewedChannelName} from 'selectors/local_storage';
import {Constants} from 'utils/constants';

import DeleteChannel from './delete_channel';

const mapStateToProps = (state) => ({
    penultimateViewedChannelName: getPenultimateViewedChannelName(state) || Constants.DEFAULT_CHANNEL,
});

export default connect(mapStateToProps)(DeleteChannel);
