// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import CustomPluginSettings from './custom_plugin_settings.jsx';

function mapStateToProps(state, ownProps) {
    const pluginId = ownProps.match.params.plugin_id;
    const plugin = state.entities.admin.plugins[pluginId];
    const settings = plugin && plugin.settings_schema && plugin.settings_schema.settings && plugin.settings_schema.settings.map((setting) => {
        return {...setting, label: setting.display_name};
    });
    const translate = (plugin && plugin.translate) || false;
    return {
        schema: plugin ? {...plugin.settings_schema, id: plugin.id, name: plugin.name, settings, translate} : null,
    };
}

export default connect(mapStateToProps)(CustomPluginSettings);
