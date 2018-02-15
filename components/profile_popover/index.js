// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const showEmailAddress = config.showEmailAddress === 'true';
    const enableWebrtc = config.EnableWebrtc === 'true';

    return {
        ...ownProps,
        showEmailAddress,
        enableWebrtc
    };
}

export default connect(mapStateToProps)(ProfilePopover);
