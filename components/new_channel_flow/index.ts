// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {createChannel} from 'mattermost-redux/actions/channels';
import Permissions from 'mattermost-redux/constants/permissions';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {ServerError} from 'mattermost-redux/types/errors';
import {GlobalState} from 'mattermost-redux/types/store';

import {switchToChannel} from 'actions/views/channel';
import {closeModal} from 'actions/views/modals';

import NewChannelFlow from './new_channel_flow';

type Actions = {
    createChannel: (channel: Channel) => Promise<{data: Channel; error?: ServerError}>;
    switchToChannel: (channel: Channel) => Promise<{}>;
    closeModal: (modalId: string) => void;
}

function mapStateToProps(state: GlobalState) {
    const currentTeam = getCurrentTeam(state);
    const currentChannelId = getCurrentChannelId(state);

    let canCreatePublicChannel = false;
    let canCreatePrivateChannel = false;

    if (currentTeam) {
        canCreatePublicChannel = haveIChannelPermission(state, {channel: currentChannelId, team: currentTeam.id, permission: Permissions.CREATE_PUBLIC_CHANNEL});
        canCreatePrivateChannel = haveIChannelPermission(state, {channel: currentChannelId, team: currentTeam.id, permission: Permissions.CREATE_PRIVATE_CHANNEL});
    }

    return {
        currentTeamId: currentTeam.id,
        canCreatePrivateChannel,
        canCreatePublicChannel,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            createChannel,
            switchToChannel,
            closeModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewChannelFlow);
