// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import ChannelInfoModal from './channel_info_modal.jsx';

const mapStateToProps = (state) => ({
    currentTeam: getCurrentTeam(state)
});

export default connect(mapStateToProps)(ChannelInfoModal);
