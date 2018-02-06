// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

// import {createSelector} from 'reselect';

import CenterChannel from './center_channel';
import {withRouter} from 'react-router-dom';

function mapStateToProps(state) {
    return {};
}

export default withRouter(connect(mapStateToProps)(CenterChannel));
