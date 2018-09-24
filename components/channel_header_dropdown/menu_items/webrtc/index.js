// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {closeRightHandSide} from 'actions/views/rhs';

import Webrtc from './webrtc';

const mapStateToProps = createSelector(
    getConfig,
    (config) => ({isWebrtcEnabled: config.EnableWebrtc === 'true'}),
);

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        closeRightHandSide,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Webrtc);
