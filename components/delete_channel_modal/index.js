// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {deleteChannel} from 'mattermost-redux/actions/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import DeleteChannelModal from './delete_channel_modal.jsx';

const mapStateToProps = (state) => ({
    currentTeamDetails: getCurrentTeam(state)
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        deleteChannel
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteChannelModal);
