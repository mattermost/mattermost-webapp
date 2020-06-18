// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import ChannelHeaderPlug from './channel_header_plug.jsx';

function mapStateToProps(state, ownProps) {
    let components = state.plugins.components.ChannelHeaderButton;
    if (ownProps && ownProps.callPlugins) {
        components = state.plugins.components.ChannelHeaderCallButton;
    }
    return {
        components,
        theme: getTheme(state),
    };
}

export default connect(mapStateToProps)(ChannelHeaderPlug);
