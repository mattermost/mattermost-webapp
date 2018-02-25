// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import CustomPluginSettings from './custom_plugin_settings.jsx';

function mapStateToProps(state, ownProps) {
    const pluginId = ownProps.match.params.plugin_id;

    return {
        plugin: state.entities.admin.plugins[pluginId],
    };
}

export default connect(mapStateToProps)(CustomPluginSettings);
