// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const showEmailAddress = config.ShowEmailAddress === 'true';
    const enableWebrtc = config.EnableWebrtc === 'true';
    const enableTimezone = config.ExperimentalTimezone === 'true';

    return {
        ...ownProps,
        showEmailAddress,
        enableWebrtc,
        enableTimezone,
    };
}

export default connect(mapStateToProps)(ProfilePopover);
