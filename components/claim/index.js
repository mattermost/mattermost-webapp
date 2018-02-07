// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import ClaimController from './claim_controller.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const siteName = config.SiteName;
    const ldapLoginFieldName = config.LdapLoginFieldName;

    return {
        ...ownProps,
        siteName,
        ldapLoginFieldName
    };
}

export default connect(mapStateToProps)(ClaimController);
