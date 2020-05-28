
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPluginId} from 'selectors/rhs';

import RHSPlugin from './rhs_plugin.jsx';

function mapStateToProps(state) {
    const rhsPlugins = state.plugins.components.RightHandSidebarComponent;
    const pluginId = getPluginId(state);

    const pluginComponent = rhsPlugins.find((element) => element.pluginId === pluginId);
    const pluggableId = pluginComponent ? pluginComponent.id : null;
    const pluginTitle = pluginComponent ? pluginComponent.title : '';
    const icons = pluginComponent ? pluginComponent.icons : [];

    return {
        showPluggable: Boolean(pluggableId),
        pluggableId,
        title: pluginTitle,
        icons,
    };
}

export default connect(mapStateToProps)(RHSPlugin);
