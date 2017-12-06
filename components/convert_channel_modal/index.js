// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {updateChannel} from 'mattermost-redux/actions/channels';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import ConvertChannelModal from './convert_channel_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        currentTeamDetails: getCurrentTeam(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateChannel
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConvertChannelModal);
