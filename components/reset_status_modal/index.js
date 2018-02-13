// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {setStatus} from 'mattermost-redux/actions/users';
import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {autoResetStatus} from 'actions/user_actions.jsx';

import ResetStatusModal from './reset_status_modal.jsx';

const mapStateToProps = (state) => {
    const {currentUserId} = state.entities.users;
    return {
        autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, currentUserId, '')
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        autoResetStatus,
        setStatus,
        savePreferences
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetStatusModal);
