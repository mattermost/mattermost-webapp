// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {areTimezonesEnabledAndSupported} from 'selectors/general';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const enableWebrtc = config.EnableWebrtc === 'true';

    return {
        ...ownProps,
        enableWebrtc,
        enableTimezone: areTimezonesEnabledAndSupported(state),
    };
}

export default connect(mapStateToProps)(ProfilePopover);
