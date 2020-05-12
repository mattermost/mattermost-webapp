// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {ChannelStats} from 'mattermost-redux/types/channels';

import {getChannelStats} from 'mattermost-redux/actions/channels';

import {getChannelMembersInChannels, getAllChannelStats, getChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetProfilesInChannel, searchProfilesInChannel} from 'mattermost-redux/selectors/entities/users';

import {loadProfilesAndReloadChannelMembers, searchProfilesAndChannelMembers} from 'actions/user_actions';
import {setModalSearchTerm} from 'actions/views/search';
import {GlobalState} from 'types/store';

import ChannelMembers from './channel_members';

type Props = {
    channelId: string;
    usersToAdd: Dictionary<UserProfile>;
    usersToRemove: Dictionary<UserProfile>;
};

type Actions = {
    getChannelStats: (channelId: string) => Promise<{
        data: boolean;
    }>;
    loadProfilesAndReloadChannelMembers: (page: number, perPage: number, channelId?: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    searchProfilesAndChannelMembers: (term: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    setModalSearchTerm: (term: string) => Promise<{
        data: boolean;
    }>;
};

function mapStateToProps(state: GlobalState, props: Props) {
    const doGetProfilesInChannel = makeGetProfilesInChannel();
    const {channelId, usersToAdd, usersToRemove} = props;
    const channelMembers = getChannelMembersInChannels(state)[channelId] || {};

    const channel = getChannel(state, channelId) || {channel_id: channelId};

    const stats: ChannelStats = getAllChannelStats(state)[channelId] || {
        member_count: 0,
        channel_id: channelId,
        pinnedpost_count: 0,
    };

    const searchTerm = state.views.search.modalSearch;
    let users = [];
    if (searchTerm) {
        users = searchProfilesInChannel(state, channelId, searchTerm);
    } else {
        users = doGetProfilesInChannel(state, channelId, false);
    }

    return {
        channelId,
        channel,
        users,
        channelMembers,
        usersToAdd,
        usersToRemove,
        totalCount: stats.member_count,
        searchTerm,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getChannelStats,
            loadProfilesAndReloadChannelMembers,
            searchProfilesAndChannelMembers,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelMembers);
