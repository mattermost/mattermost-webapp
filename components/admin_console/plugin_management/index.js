// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPlugins, removePlugin, uploadPlugin, activatePlugin, deactivatePlugin} from 'mattermost-redux/actions/admin';

import PluginManagement from './plugin_management.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        plugins: state.entities.admin.plugins,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            uploadPlugin,
            removePlugin,
            getPlugins,
            activatePlugin,
            deactivatePlugin,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PluginManagement);
