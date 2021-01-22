import { GlobalState } from "types/store";
import { getCurrentUser } from 'mattermost-redux/selectors/entities/users';
import Constants from "./constants";

export function showPulsatingDot(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props;
    if (!userProps) {
        return true;
    }

    const hasClickedOnUpdateStatusBefore = userProps.initialProps === Constants.CustomStatusInitialProps.CLICK_ON_UPDATE_STATUS_FROM_POST;
    
    const hasClickedOnDropdownIconBefore =userProps.initialProps === Constants.CustomStatusInitialProps.CLICK_ON_SIDEBAR_HEADER_DROPDOWN_ICON;
    return true;
}

export function showUpdateStatusButton(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props;
    if (!userProps) {
        return true;
    }

    const hasSetCustomStatusBefore = userProps && userProps.recentCustomStatuses;
    const hasClickedOnUpdateStatusBefore = userProps.initialProps === Constants.CustomStatusInitialProps.CLICK_ON_UPDATE_STATUS_FROM_POST;
    return !(hasSetCustomStatusBefore || hasClickedOnUpdateStatusBefore);
}