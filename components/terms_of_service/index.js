// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import TermsOfService from './terms_of_service';

function mapStateToProps(state) {
    const config = getConfig(state);
    return {
        config,
        termsEnabled: config.CustomServiceTermsEnabled === 'true',
    };
}

export default connect(mapStateToProps)(TermsOfService);
