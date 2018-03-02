// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPlugins} from 'mattermost-redux/actions/admin';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import AdminSidebar from './admin_sidebar.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);
    const buildEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const siteName = config.SiteName;

    return {
        license,
        config: state.entities.admin.config,
        plugins: state.entities.admin.plugins,
        buildEnterpriseReady,
        siteName,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPlugins,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {pure: false})(AdminSidebar);
