// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {doPostAction} from 'mattermost-redux/actions/posts';

import ActionMenu from './action_menu.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            doPostAction,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(ActionMenu);
