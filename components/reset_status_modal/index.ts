// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store/index.js';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions.js';

import {UserStatus} from 'mattermost-redux/types/users.js';

import {PreferenceType} from 'mattermost-redux/types/preferences.js';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {setStatus} from 'mattermost-redux/actions/users';
import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserStatus, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';

import {autoResetStatus} from 'actions/user_actions.jsx';

import ResetStatusModal from './reset_status_modal';

function mapStateToProps(state: GlobalState) {
    const {currentUserId} = state.entities.users;
    return {
        autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, currentUserId, ''),
        // currentUserStatus: getStatusForUserId(state, currentUserId),
        currentUserStatus: getCurrentUserStatus(state).status,
    };
}

type Actions = {
    autoResetStatus: () => Promise<UserStatus>;
    setStatus: (status: UserStatus) => void;
    savePreferences: (userId: string, preferences: PreferenceType[]) => void;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    const actions = bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
        setStatus,
        savePreferences,
    }, dispatch);

    const autoResetStatusAction = bindActionCreators<ActionCreatorsMapObject<UserStatus>, any>({
        autoResetStatus,
    }, dispatch);

    return {
        actions: {...actions, ...autoResetStatusAction},
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetStatusModal);
