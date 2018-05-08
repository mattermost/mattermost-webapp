// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {closeMenu as closeRhsMenu} from 'actions/views/rhs';

import TutorialTip from './tutorial_tip.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRhsMenu,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(TutorialTip);
