// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setStatus} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';
import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {openModal} from 'actions/views/modals';

import StatusDropdown from 'components/status_dropdown/status_dropdown.jsx';

function mapStateToProps(state) {
    const cUser = getCurrentUser(state);

    if (!cUser) {
        return {};
    }

    return {
        currentUser: cUser,
        profilePicture: Client4.getProfilePictureUrl(cUser.id, cUser.last_picture_update),
        autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, cUser.id, ''),
        status: getStatusForUserId(state, cUser.id),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            setStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusDropdown);
