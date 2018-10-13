// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {goToChannel, openDirectChannelToUser} from 'actions/channel_actions.jsx';

import {makeGetChannelUrlById} from 'utils/channel_utils';

import QuickSwitchModal from './quick_switch_modal.jsx';

function mapStateToProps(state) {
    const getChannelUrlById = makeGetChannelUrlById(state);

    return {
        showTeamSwitcher: false,
        getChannelUrlById,
    };
}

function mapDispatchToProps() {
    return {
        actions: {
            goToChannel,
            openDirectChannelToUser,
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickSwitchModal);
