// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'mattermost-redux/types/store';

import SystemAnalytics from './system_analytics';

function mapStateToProps(state: GlobalState) {
    const license = getLicense(state);
    const isLicensed = license.IsLicensed === 'true';

    return {
        isLicensed,
        stats: state.entities.admin.analytics,
    };
}

export default connect(mapStateToProps)(SystemAnalytics);
