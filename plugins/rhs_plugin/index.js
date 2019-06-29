
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPluginId} from 'selectors/rhs';

import RHSPlugin from './rhs_plugin.jsx';

function mapStateToProps(state) {
    const rhsPlugins = state.plugins.components.RightHandSidebarComponent;
    const pluginId = getPluginId(state);

    const pluginName = rhsPlugins.find((element) => element.id === pluginId).title;

    return {
        title: pluginName,
        pluggableId: pluginId,
    };
}

export default connect(mapStateToProps)(RHSPlugin);
