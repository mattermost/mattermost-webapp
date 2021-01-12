// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { updateMe } from 'mattermost-redux/actions/users';

import { getCurrentUser, getCurrentUserId } from 'mattermost-redux/selectors/entities/users';
import { getUserTimezone } from 'mattermost-redux/selectors/entities/timezone';

import { GlobalState } from 'types/store';

import { getCurrentDateForTimezone } from 'utils/timezone';
import { areTimezonesEnabledAndSupported } from 'selectors/general';

import CustomStatusInputModal from './custom_status_input_modal';

function mapStateToProps(state: GlobalState) {
    const user = getCurrentUser(state);
    const userId = user.id;
    const userTimezone = getUserTimezone(state, userId);

    const enableTimezone = areTimezonesEnabledAndSupported(state);

    let cDate;
    if (enableTimezone) {
        if (userTimezone.useAutomaticTimezone) {
            cDate = getCurrentDateForTimezone(userTimezone.automaticTimezone);
        } else {
            cDate = getCurrentDateForTimezone(userTimezone.manualTimezone);
        }
    }
    return {
        userId,
        currentDate: cDate,
        currentUser: user,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            updateMe,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomStatusInputModal);
