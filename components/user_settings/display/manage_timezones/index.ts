// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {updateMe} from 'mattermost-redux/actions/users';
import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {UserProfile} from 'mattermost-redux/types/users';

import ManageTimezones from './manage_timezones';

type Actions = {
    updateMe: (user: UserProfile) => Promise<ActionResult>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            updateMe,
        }, dispatch)};
}

export default connect(null, mapDispatchToProps)(ManageTimezones);

