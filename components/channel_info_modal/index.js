// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import ChannelInfoModal from './channel_info_modal.jsx';

function mapStateToProps(state) {
    return {
        currentTeam: getCurrentTeam(state),
    };
}

export default connect(mapStateToProps)(ChannelInfoModal);
