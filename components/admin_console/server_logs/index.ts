// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getLogs} from 'mattermost-redux/actions/admin';

import * as Selectors from 'mattermost-redux/selectors/entities/admin';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import LogList from './log_list';

function mapStateToProps(state: GlobalState) {
    return {
        logs: Selectors.getAllLogs(state),
    };
}

export default connect(mapStateToProps)(LogList);
