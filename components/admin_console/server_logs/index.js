// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getLogs} from 'mattermost-redux/actions/admin';
import * as Selectors from 'mattermost-redux/selectors/entities/admin';

import Logs from './logs.jsx';

function mapStateToProps(state) {
    return {
        logs: Selectors.getLogs(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getLogs,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Logs);
