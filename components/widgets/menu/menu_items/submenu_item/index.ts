// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {showMobileSubMenuModal} from 'actions/global_actions.jsx';

import {SubMenuItem, Props} from './submenu_item';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            showMobileSubMenuModal,
        }, dispatch),
    };
}

export default connect<{}, {}, Props>(null, mapDispatchToProps)(SubMenuItem);
