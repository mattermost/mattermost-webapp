// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Preferences} from 'mattermost-redux/constants';

import {savePreferences} from 'mattermost-redux/actions/preferences';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import EmailNotificationSetting from './email_notification_setting';

type Actions = {
    savePreferences: (currentUserId: string, emailIntervalPreference: {}) =>
    Promise<{}>;
}

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const emailInterval = parseInt(getPreference(
        state,
        Preferences.CATEGORY_NOTIFICATIONS,
        Preferences.EMAIL_INTERVAL,
        Preferences.INTERVAL_NOT_SET.toString(),
    ), 10);

    return {
        currentUserId: getCurrentUserId(state),
        emailInterval,
        enableEmailBatching: true,
        sendEmailNotifications: config.SendEmailNotifications === 'true',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailNotificationSetting);
