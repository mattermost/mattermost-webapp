// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';

import {getPasswordConfig} from 'utils/utils.jsx';

import ClaimController from './claim_controller.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);
    const siteName = config.SiteName;
    const ldapLoginFieldName = config.LdapLoginFieldName;

    return {
        siteName,
        ldapLoginFieldName,
        passwordConfig: getPasswordConfig(license, config),
    };
}

export default connect(mapStateToProps)(ClaimController);
