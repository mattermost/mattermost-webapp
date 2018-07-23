// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPluginStatuses, removePlugin, uploadPlugin, enablePlugin, disablePlugin} from 'mattermost-redux/actions/admin';

import PluginManagement from './plugin_management.jsx';

function mapStateToProps(state) {
    return {
        plugins: state.entities.admin.plugins,
        pluginStatuses: state.entities.admin.pluginStatuses,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            uploadPlugin,
            removePlugin,
            getPluginStatuses,
            enablePlugin,
            disablePlugin,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PluginManagement);
