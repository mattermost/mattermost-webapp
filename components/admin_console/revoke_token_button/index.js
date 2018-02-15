// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {revokeUserAccessToken} from 'mattermost-redux/actions/users';

import RevokeTokenButton from './revoke_token_button.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        revokeUserAccessToken
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(RevokeTokenButton);
