// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getMe} from 'mattermost-redux/actions/users';

import UserSettingsGeneralTab from './user_settings_general.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getMe
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(UserSettingsGeneralTab);
