// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {clearUserAccessTokens, createUserAccessToken, getUserAccessTokensForUser, revokeUserAccessToken, enableUserAccessToken, disableUserAccessToken} from 'mattermost-redux/actions/users';

import UserAccessTokenSection from './user_access_token_section.jsx';

function mapStateToProps(state) {
    return {
        userAccessTokens: state.entities.users.myUserAccessTokens,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getUserAccessTokensForUser,
            createUserAccessToken,
            revokeUserAccessToken,
            enableUserAccessToken,
            disableUserAccessToken,
            clearUserAccessTokens,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAccessTokenSection);
