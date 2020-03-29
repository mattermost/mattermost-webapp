
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {leaveChannel} from 'actions/views/channel';

import SidebarBaseChannel from './sidebar_base_channel';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        enableXToLeaveChannelsFromLHS: config.EnableXToLeaveChannelsFromLHS,
    };
}

type Actions = {
    leaveChannel: (channelId: any) => Promise<{
        error: any;
        data?: undefined;
    } | {
        data: boolean;
        error?: undefined;
    }>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            leaveChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarBaseChannel);
