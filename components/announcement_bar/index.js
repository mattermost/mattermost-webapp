// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {haveISystemPerm} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import AnnouncementBar from './announcement_bar.jsx';

function mapStateToProps(state) {
    const canViewSystemErrors = haveISystemPerm(state, {perm: Permissions.MANAGE_SYSTEM});
    return {
        isLoggedIn: Boolean(getCurrentUserId(state)),
        canViewSystemErrors
    };
}

export default connect(mapStateToProps)(AnnouncementBar);
