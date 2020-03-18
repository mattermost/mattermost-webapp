// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {Channel} from 'mattermost-redux/types/channels';
import {getCurrentChannelId, getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getUserIdsInChannels, getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import SidebarGroupChannel from './sidebar_group_channel';

type OwnProps = {
    channel: Channel;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentUser = getCurrentUser(state);
    const currentTeam = getCurrentTeam(state);
    const redirectChannel = getRedirectChannelNameForTeam(state, currentTeam.id);
    const currentChannelId = getCurrentChannelId(state);
    const active = ownProps.channel.id === currentChannelId;

    const memberIds = getUserIdsInChannels(state);

    let membersCount = 0;
    if (memberIds && memberIds[ownProps.channel.id]) {
        const groupMemberIds: Set<string> = memberIds[ownProps.channel.id] as unknown as Set<string>;
        membersCount = groupMemberIds.size;
        if (groupMemberIds.has(currentUser.id)) {
            membersCount--;
        }
    }

    return {
        currentUserId: currentUser.id,
        redirectChannel,
        active,
        membersCount,
    };
}

type Actions = {
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{
        data: boolean;
    }>;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarGroupChannel);
