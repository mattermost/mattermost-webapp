// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPlugins} from 'mattermost-redux/actions/admin';

import AdminSidebar from './admin_sidebar.jsx';

const mapStateToProps = (state) => ({
    config: state.entities.admin.config,
    plugins: state.entities.admin.plugins
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getPlugins
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps, null, {pure: false})(AdminSidebar);
