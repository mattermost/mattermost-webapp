// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {setStatus} from 'mattermost-redux/actions/users';
import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getStatusForUserId} from 'mattermost-redux/selectors/entities/users';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {UserStatus} from 'mattermost-redux/types/users';

import {autoResetStatus} from 'actions/user_actions.jsx';

import ResetStatusModal from './reset_status_modal';
import {ActionFunc, GenericAction } from 'mattermost-redux/types/actions';
import { GlobalState } from 'mattermost-redux/types/store';

type Actions = {
    
        /*
         * Function to get and then reset the user's status if needed
         */
        autoResetStatus: () => Promise<UserStatus>;

        /*
         * Function to set the status for a user
         */
        setStatus: (status: UserStatus) => ActionFunc;

        /*
         * Function to save user preferences
         */
        savePreferences: (userId: string, preferences: Array<PreferenceType>) => Promise<{
            data: boolean;
        }>;
}

function mapStateToProps(state: GlobalState) {
    const {currentUserId} = state.entities.users;
    return {
        autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, currentUserId, ''),
        currentUserStatus: getStatusForUserId(state, currentUserId),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            autoResetStatus,
            setStatus,
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetStatusModal);
