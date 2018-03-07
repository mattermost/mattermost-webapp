// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {getPasswordConfig} from 'utils/utils.jsx';

import ResetPasswordModal from './reset_password_modal.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    return {
        passwordConfig: getPasswordConfig(license, config),
    };
}

export default connect(mapStateToProps)(ResetPasswordModal);
