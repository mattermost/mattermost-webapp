import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import EnableNotificationsBar from './enable_notifications_bar';
import { isNotificationsPermissionGranted } from 'selectors/browser';
import { enableBrowserNotifications } from 'actions/notification_actions';

function mapStateToProps(state: GlobalState) {
    return {
        isNotificationsPermissionGranted: isNotificationsPermissionGranted(state)
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            enableBrowserNotifications,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EnableNotificationsBar);