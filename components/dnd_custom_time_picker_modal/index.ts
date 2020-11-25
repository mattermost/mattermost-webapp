// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { setStatus } from 'mattermost-redux/actions/users';

import { getCurrentUserId } from 'mattermost-redux/selectors/entities/users';
import { getUserTimezone } from 'mattermost-redux/selectors/entities/timezone';

import { GlobalState } from 'types/store';


import { getCurrentDateForTimezone } from 'utils/timezone';
import { areTimezonesEnabledAndSupported } from 'selectors/general';

import DndCustomTimePicker from './dnd_custom_time_picker';

function mapStateToProps(state: GlobalState) {
    const userId = getCurrentUserId(state);
    const userTimezone = getUserTimezone(state, userId);

    const enableTimezone = areTimezonesEnabledAndSupported(state);

    let currentDate;
    if (enableTimezone) {
        if (userTimezone.useAutomaticTimezone) {
            currentDate = getCurrentDateForTimezone(userTimezone.automaticTimezone);
        } else {
            currentDate = getCurrentDateForTimezone(userTimezone.manualTimezone);
        }
    }
    return {
        userId,
        currentDate,
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
