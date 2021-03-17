// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AnyAction, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {convertChannelToPrivate} from 'mattermost-redux/actions/channels';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';

import ConvertChannelModal from './convert_channel_modal';

function mapStateToProps(state: GlobalState) {
    return {
        currentTeamDetails: getCurrentTeam(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            convertChannelToPrivate,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConvertChannelModal);
