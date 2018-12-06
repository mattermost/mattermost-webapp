// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {joinChannelById, switchToChannel} from 'actions/views/channel';

import QuickSwitchModal from './quick_switch_modal.jsx';

function mapStateToProps() {
    return {
        showTeamSwitcher: false,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            joinChannelById,
            switchToChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickSwitchModal);
