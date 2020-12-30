// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getUser} from 'mattermost-redux/selectors/entities/users';
import {updateUserActive} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {addUserToTeam} from 'mattermost-redux/actions/teams';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'mattermost-redux/types/store';

import {ServerError} from 'mattermost-redux/types/errors';

import {TeamMembership} from 'mattermost-redux/types/teams';

import {setNavigationBlocked} from 'actions/admin_actions.jsx';

import SystemUserDetail from './system_user_detail';

type OwnProps = {
    match: any;
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

type Actions = {
    updateUserActive: (userId: string, active: boolean) => Promise<{error: ServerError}>;
    setNavigationBlocked: (blocked: boolean) => void;
    addUserToTeam: (teamId: string, userId?: string) => Promise<{data: TeamMembership; error?: any}>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    const apiActions = bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
        updateUserActive,
        addUserToTeam,
    }, dispatch);
    const uiActions = bindActionCreators({
        setNavigationBlocked,
    }, dispatch);

    const props = {
        actions: Object.assign(apiActions, uiActions),
    };

    return props;
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUserDetail);
