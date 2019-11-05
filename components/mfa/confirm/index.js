// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {redirectUserToDefaultTeam} from 'actions/global_actions.jsx';

import Confirm from './confirm.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            redirectUserToDefaultTeam,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(Confirm);
