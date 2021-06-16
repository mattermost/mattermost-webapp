import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import EnableNotificationsBar from './enable_notifications_bar';
import { isNotificationsPermissionGranted } from 'selectors/browser';
import { enableBrowserNotifications, trackEnableNotificationsBarDisplay } from 'actions/notification_actions';
import { getGlobalItem } from 'selectors/storage';
import { StoragePrefixes } from 'utils/constants';

function mapStateToProps(state: GlobalState) {
    const areNotificationsDisabled = !isNotificationsPermissionGranted(state);
    const showBarAt = getGlobalItem(state, StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT, null);
    const isBarDismissedForever = showBarAt === null;
    
    let show = areNotificationsDisabled;

    if (isBarDismissedForever) {
        show = false;
    } else {
        const shouldShowBar = Date.now() > showBarAt;

        show = show && shouldShowBar;
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