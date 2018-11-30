// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getTermsOfService, updateMyTermsOfServiceStatus} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import TermsOfService from './terms_of_service';

function mapStateToProps(state) {
    const config = getConfig(state);
    return {
        termsEnabled: config.EnableCustomTermsOfService === 'true',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTermsOfService,
            updateMyTermsOfServiceStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TermsOfService);
