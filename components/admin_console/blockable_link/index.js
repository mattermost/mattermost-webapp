// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {deferNavigation} from 'actions/admin_actions.jsx';
import {getNavigationBlocked} from 'selectors/views/admin';

import BlockableLink from './blockable_link.jsx';

function mapStateToProps(state) {
    return {
        blocked: getNavigationBlocked(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deferNavigation,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BlockableLink);
