import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';
import EnableNotificationsBar from './enable_notifications_bar';
import { enableBrowserNotifications, trackEnableNotificationsBarDisplay, disableNotificationsPermissionRequests } from 'actions/notification_actions';
import { shouldShowEnableNotificationsBar } from 'selectors/views/enable_notifications_bar';

function mapStateToProps(state: GlobalState) {
    return {
        show: shouldShowEnableNotificationsBar(state)
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            enableBrowserNotifications,
            trackEnableNotificationsBarDisplay,
            disableNotificationsPermissionRequests,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EnableNotificationsBar);