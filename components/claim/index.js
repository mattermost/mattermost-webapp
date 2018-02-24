// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import ClaimController from './claim_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const siteName = config.SiteName;
    const ldapLoginFieldName = config.LdapLoginFieldName;

    return {
        siteName,
        ldapLoginFieldName,
    };
}

export default connect(mapStateToProps)(ClaimController);
