// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getUser, getProfiles} from 'mattermost-redux/selectors/entities/users';
import {updateUserActive} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {addUserToTeam} from 'mattermost-redux/actions/teams';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'mattermost-redux/types/store';

import {setNavigationBlocked, deferNavigation, cancelNavigation, confirmNavigation} from 'actions/admin_actions.jsx';
import {getNavigationBlocked, showNavigationPrompt} from 'selectors/views/admin';

import SystemUserDetail, {Props} from './system_user_detail';

function mapStateToProps(state: GlobalState, ownProps: Props & { match: any }) {
    const config = getConfig(state);
    const userId = ownProps.match.params.user_id;
    const user = getUser(state, userId);
    return {
        user,
        mfaEnabled: config.EnableMultifactorAuthentication === 'true',
        navigationBlocked: getNavigationBlocked(state),
        showNavigationPrompt: showNavigationPrompt(state),
    } as any;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getUser,
            getProfiles,
            updateUserActive,
            setNavigationBlocked,
            deferNavigation,
            cancelNavigation,
            confirmNavigation,
            addUserToTeam,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUserDetail);
