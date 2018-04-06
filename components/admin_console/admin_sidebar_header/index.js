// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import SidebarHeader from './admin_sidebar_header.jsx';

function mapStateToProps(state) {
    return {
        user: getCurrentUser(state),
    };
}

export default connect(mapStateToProps)(SidebarHeader);
