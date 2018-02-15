// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {trackEvent} from 'actions/diagnostics_actions.jsx';

import TeamSignupDisplayNamePage from './display_name';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            trackEvent: bindActionCreators(trackEvent, dispatch)
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamSignupDisplayNamePage);
