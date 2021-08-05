// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {updateMe} from 'mattermost-redux/actions/users';
import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';
import {getSupportedTimezones} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';
import {getTimezoneLabel} from 'mattermost-redux/selectors/entities/timezone';

import ManageTimezones from './manage_timezones';

type Actions = {
    updateMe: (user: UserProfile) => Promise<ActionResult>;
}

type OwnProps = {
    manualTimezone: string;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            updateMe,
        }, dispatch)};
}
function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const timezoneLabel = getTimezoneLabel(state, ownProps.manualTimezone);
    return {
        timezones: getSupportedTimezones(state),
        timezoneLabel,
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(ManageTimezones);

