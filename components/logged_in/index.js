// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {autoUpdateTimezone} from 'mattermost-redux/actions/timezone';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';

import {checkIfMFARequired} from 'utils/route';

import LoggedIn from './logged_in.jsx';

function mapStateToProps(state, ownProps) {
    const license = getLicense(state);
    const config = getConfig(state);

    return {
        mfaRequired: checkIfMFARequired(license, config, ownProps.match.url),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            autoUpdateTimezone,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggedIn);
