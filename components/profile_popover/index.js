// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const enableWebrtc = config.EnableWebrtc === 'true';
    const enableTimezone = config.ExperimentalTimezone === 'true';

    return {
        ...ownProps,
        enableWebrtc,
        enableTimezone,
    };
}

export default connect(mapStateToProps)(ProfilePopover);
