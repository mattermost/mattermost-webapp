// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import { getTeam } from 'mattermost-redux/selectors/entities/teams';

import { GlobalState } from 'mattermost-redux/types/store';

import { joinChannelById, switchToChannel } from 'actions/views/channel';

import ForwardMessageModal from './forward_message_modal';

type Props = {
    channelId: string,

    teamId: string,
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            joinChannelById,
            switchToChannel,
        }, dispatch),
    };
}

function mapStateToProps(state: GlobalState, props: Props) {
    const channel = getChannel(state, props.channelId);
    const team = getTeam(state, props.teamId);

    return {
        channelDisplayName: channel.display_name,
        teamDisplayName: team.display_name,
        channel: channel,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ForwardMessageModal);