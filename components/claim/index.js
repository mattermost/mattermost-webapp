// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {checkMfa} from 'actions/views/mfa';
import {getPasswordConfig} from 'utils/utils.jsx';

import ClaimController from './claim_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const siteName = config.SiteName;
    const ldapLoginFieldName = config.LdapLoginFieldName;

    return {
        siteName,
        ldapLoginFieldName,
        passwordConfig: getPasswordConfig(config),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            checkMfa,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClaimController);
