// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import SystemAnalytics from './system_analytics.jsx';

function mapStateToProps(state) {
    const license = state.entities.general.license;
    const isLicensed = license.IsLicensed === 'true';

    return {
        isLicensed
    };
}

export default connect(mapStateToProps)(SystemAnalytics);
