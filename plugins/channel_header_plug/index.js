// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getPluginIntegrations} from 'mattermost-redux/selectors/entities/plugins';
import {fetchMobilePluginIntegrations} from 'mattermost-redux/actions/plugins';
import PluginLocation from 'mattermost-redux/constants/plugins';

import ChannelHeaderPlug from './channel_header_plug.jsx';

function mapStateToProps(state) {
    return {
        components: state.plugins.components.ChannelHeaderButton,
        integrations: getPluginIntegrations(state, PluginLocation.PLUGIN_LOCATION_CHANNEL_HEADER),
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            fetchMobilePluginIntegrations,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderPlug);
