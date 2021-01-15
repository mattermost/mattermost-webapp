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
import {unsetUserCustomStatus} from 'actions/views/custom_status';
import {getCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state);

    if (!currentUser) {
        return {};
    }

    const userId = currentUser.id;
    return {
        userId,
        profilePicture: Client4.getProfilePictureUrl(userId, currentUser.last_picture_update),
        autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, userId, ''),
        status: getStatusForUserId(state, userId),
        customStatus: getCustomStatus(state, userId),
        isCustomStatusEnabled: isCustomStatusEnabled(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            setStatus,
            unsetUserCustomStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusDropdown);
