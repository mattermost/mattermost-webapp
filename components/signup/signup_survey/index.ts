// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import {removeGlobalItem} from 'actions/storage';
import {getGlobalItem} from 'selectors/storage';
import {StoragePrefixes, SurveyTypes} from 'utils/constants';

import SignupSurvey from './signup_survey';

function mapStateToProps(state: GlobalState) {
    const {
        SiteName: siteName = '',
        CustomDescriptionText: customDescriptionText = '',
        DiagnosticsEnabled: diagnosticsEnabled,
    } = getConfig(state);

    const {
        id: currentUserId,
        roles: currentUserRoles = '',
    } = getCurrentUser(state);

    return {
        siteName,
        customDescriptionText,
        currentUserId,
        currentUserRoles,
        signupSurveyUserId: getGlobalItem(state, StoragePrefixes.SURVEY + SurveyTypes.SIGNUP),
        diagnosticsEnabled: diagnosticsEnabled === 'true',
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            removeGlobalItem,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupSurvey);
