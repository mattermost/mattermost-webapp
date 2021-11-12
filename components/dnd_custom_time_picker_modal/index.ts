// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {setStatus} from 'mattermost-redux/actions/users';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';
import {makeAsyncComponent} from 'components/async_load';

const DndCustomTimePicker = makeAsyncComponent(React.lazy(() => import('./dnd_custom_time_picker_modal')));

function mapStateToProps(state: GlobalState) {
    const userId = getCurrentUserId(state);

    return {
        userId,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            setStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DndCustomTimePicker);
