// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getPluginsLocations} from 'mattermost-redux/selectors/entities/plugins';
import {executeCommand} from 'actions/command';
import PluginLocation from 'mattermost-redux/constants/plugins';

import ChannelHeaderPlug from './channel_header_plug.jsx';

function mapStateToProps(state) {
    return {
        components: state.plugins.components.ChannelHeaderButton,
        locations: getPluginsLocations(state, PluginLocation.PLUGIN_LOCATION_CHANNEL_HEADER_ICON),
        theme: getTheme(state),
        executeCommand,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            executeCommand,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderPlug);
