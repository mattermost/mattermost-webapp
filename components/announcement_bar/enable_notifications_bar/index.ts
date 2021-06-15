import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import EnableNotificationsBar from './enable_notifications_bar';
import { isNotificationsPermissionGranted } from 'selectors/browser';
import { enableBrowserNotifications, trackEnableNotificationsBarDisplay } from 'actions/notification_actions';
import { getGlobalItem } from 'selectors/storage';
import Constants from 'utils/constants';
import { StoragePrefixes } from 'utils/constants';

function mapStateToProps(state: GlobalState) {
    const areNotificationsDisabled = !isNotificationsPermissionGranted(state);
    const showBarLastTimeAt = getGlobalItem(state, StoragePrefixes.SHOW_LAST_ENABLE_DESKTOP_NOTIFICATIONS_BAR_AT, 0);
    const isLastPermissionsRequestScheduled = showBarLastTimeAt !== 0;
    const barShownTimes = getGlobalItem(state, StoragePrefixes.ENABLE_DESKTOP_NOTIFICATIONS_BAR_SHOWN_TIMES, 0);
    const isAllowedToShowBar = barShownTimes < Constants.SCHEDULE_LAST_NOTIFICATIONS_REQUEST_AFTER_ATTEMPTS + 1;
    
    let show = areNotificationsDisabled && isAllowedToShowBar;

    if (isLastPermissionsRequestScheduled) {
        const shouldShowBarForLastTime = Date.now() > showBarLastTimeAt;

        show = show && shouldShowBarForLastTime;
    }

    return {
        show
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            enableBrowserNotifications,
            trackEnableNotificationsBarDisplay,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EnableNotificationsBar);