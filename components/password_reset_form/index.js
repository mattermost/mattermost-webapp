// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PasswordResetForm from './password_reset_form.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const siteName = config.SiteName;

    return {
        siteName,
    };
}

export default connect(mapStateToProps)(PasswordResetForm);
