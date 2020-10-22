// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getPluginsLocations} from 'mattermost-redux/selectors/entities/plugins';
import PluginLocation from 'mattermost-redux/constants/plugins';

import ChannelHeaderPlug from './channel_header_plug.jsx';

function mapStateToProps(state) {
    return {
        components: state.plugins.components.ChannelHeaderButton,
        locations: getPluginsLocations(state, PluginLocation.PLUGIN_LOCATION_CHANNEL_HEADER_ICON),
        theme: getTheme(state),
    };
}

export default connect(mapStateToProps)(ChannelHeaderPlug);
