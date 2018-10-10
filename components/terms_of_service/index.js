// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import TermsOfService from './terms_of_service';

function mapStateToProps(state) {
    const config = getConfig(state);
    return {
        customTermsOfServiceId: config.CustomTermsOfServiceId,
        privacyPolicyLink: config.PrivacyPolicyLink,
        siteName: config.SiteName,
        termsEnabled: config.EnableCustomTermsOfService === 'true',
        termsOfServiceLink: config.TermsOfServiceLink,
    };
}

export default connect(mapStateToProps)(TermsOfService);
