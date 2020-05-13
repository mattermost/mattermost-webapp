// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import SignupSurvey from './signup_survey';

function mapStateToProps(state) {
    const {
        SiteName: siteName = '',
        CustomDescriptionText: customDescriptionText = '',
    } = getConfig(state);

    const {
        id: currentUserId,
        roles: currentUserRoles = '',
    } = getCurrentUser(state);

    return {
        siteName,
        customDescriptionText,
        currentUserId,
        currentUserRoles
    };
}

export default connect(mapStateToProps)(SignupSurvey);
