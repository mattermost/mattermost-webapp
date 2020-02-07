// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import SidebarChannel from './sidebar_channel';

type OwnProps = {
    channelId: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const getChannel = makeGetChannel();
    const channel = getChannel(state, {id: ownProps.channelId});
    const currentTeam = getCurrentTeam(state);

    return {
        channel,
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
