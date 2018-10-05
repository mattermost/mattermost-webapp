// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {areTimezonesEnabledAndSupported} from 'selectors/general';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state) {
    const config = state.entities.general.config;

    const enableWebrtc = config.EnableWebrtc === 'true';

    return {
        enableWebrtc,
        enableTimezone: areTimezonesEnabledAndSupported(state),
        currentUserId: getCurrentUserId(state),
        teamUrl: '/' + getCurrentTeam(state).name,
    };
}

export default connect(mapStateToProps)(ProfilePopover);
