// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {goToChannel, goToChannelById, openDirectChannelToUser} from 'actions/channel_actions.jsx';

import QuickSwitchModal from './quick_switch_modal.jsx';

function mapStateToProps() {
    return {
        showTeamSwitcher: false,
    };
}

function mapDispatchToProps() {
    return {
        actions: {
            goToChannel,
            goToChannelById,
            openDirectChannelToUser,
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickSwitchModal);
