// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {Constants} from 'utils/constants';

import SidebarChannel from './sidebar_channel';

type OwnProps = {
    channelId: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const getChannel = makeGetChannel();
    const channel = getChannel(state, {id: ownProps.channelId});
    const currentTeam = getCurrentTeam(state);
    let teammate;

    if (channel.type === Constants.DM_CHANNEL && channel.teammate_id) {
        teammate = getUser(state, channel.teammate_id);
    }

    return {
        channel,
        teammateUsername: teammate && teammate.username,
        currentTeamName: currentTeam.name,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannel);
