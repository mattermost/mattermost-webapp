// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {deferNavigation} from 'actions/admin_actions.jsx';
import {getNavigationBlocked} from 'selectors/views/admin';

import AdminNavbarDropdown from './admin_navbar_dropdown.jsx';

const mapStateToProps = (state) => ({
    navigationBlocked: getNavigationBlocked(state)
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        deferNavigation
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminNavbarDropdown);
