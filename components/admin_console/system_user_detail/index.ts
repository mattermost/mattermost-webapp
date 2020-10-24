// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getUser} from 'mattermost-redux/selectors/entities/users';
import {updateUserActive} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {addUserToTeam} from 'mattermost-redux/actions/teams';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'mattermost-redux/types/store';

import {setNavigationBlocked} from 'actions/admin_actions.jsx';

import SystemUserDetail from './system_user_detail';

type OwnProps = {
    match: any
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const userId = ownProps.match.params.user_id;
    const user = getUser(state, userId);
    return {
        user,
        mfaEnabled: config.EnableMultifactorAuthentication === 'true',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            updateUserActive,
            setNavigationBlocked,
            addUserToTeam,
        }, dispatch),
    } as any;
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUserDetail);
