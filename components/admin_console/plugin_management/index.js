// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPlugins, removePlugin, uploadPlugin, activatePlugin, deactivatePlugin} from 'mattermost-redux/actions/admin';

import PluginManagement from './plugin_management.jsx';

const mapStateToProps = (state) => ({
    plugins: state.entities.admin.plugins
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        uploadPlugin,
        removePlugin,
        getPlugins,
        activatePlugin,
        deactivatePlugin
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PluginManagement);
