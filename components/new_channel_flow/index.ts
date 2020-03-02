// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {createChannel} from 'mattermost-redux/actions/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';

import {switchToChannel} from 'actions/views/channel';

import NewChannelFlow from './new_channel_flow';

type Actions = {
    createChannel: (channel: Channel, userId: string) => Promise<{data: {id: string; name: string}; error?: any}>;
    switchToChannel: (channel: any) => Promise<{}>;
}

function mapStateToProps(state: GlobalState) {
    return {
        currentUserId: getCurrentUserId(state),
        currentTeamId: getCurrentTeamId(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createChannel,
            switchToChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewChannelFlow);
