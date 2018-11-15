// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {openModal} from 'actions/views/modals';
import {areTimezonesEnabledAndSupported} from 'selectors/general';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state) {
    return {
        enableTimezone: areTimezonesEnabledAndSupported(state),
        currentUserId: getCurrentUserId(state),
        teamUrl: '/' + getCurrentTeam(state).name,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openDirectChannelToUserId,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePopover);
