// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';

import {filterProfilesMatchingTerm, profileListToMap} from 'mattermost-redux/utils/user_utils';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {ChannelStats} from 'mattermost-redux/types/channels';

import {getChannelStats} from 'mattermost-redux/actions/channels';

import {getChannelMembersInChannels, getAllChannelStats, getChannel} from 'mattermost-redux/selectors/entities/channels';
import {searchProfilesInChannel, makeGetProfilesInChannel, filterProfiles} from 'mattermost-redux/selectors/entities/users';

import {loadProfilesAndReloadChannelMembers, searchProfilesAndChannelMembers} from 'actions/user_actions';
import {setSystemUsersSearch} from 'actions/views/search';
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
    loadProfilesAndReloadChannelMembers: (page: number, perPage: number, channelId?: string, sort?: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    searchProfilesAndChannelMembers: (term: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    setSystemUsersSearch: (term: string) => Promise<{
        data: boolean;
    }>;
};

function searchUsersToAdd(users: Dictionary<UserProfile>, term: string): Dictionary<UserProfile> {
    const profiles = filterProfilesMatchingTerm(Object.keys(users).map((key) => users[key]), term);
    const filteredProfilesMap = filterProfiles(profileListToMap(profiles), {});

    return filteredProfilesMap;
}

function makeMapStateToProps() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();

    return function mapStateToProps(state: GlobalState, props: Props) {
        const {channelId, usersToRemove} = props;
        let {usersToAdd} = props;

        const channelMembers = getChannelMembersInChannels(state)[channelId] || {};

        const channel = getChannel(state, channelId) || {channel_id: channelId};

        const stats: ChannelStats = getAllChannelStats(state)[channelId] || {
            member_count: 0,
            channel_id: channelId,
            pinnedpost_count: 0,
            guest_count: 0,
        };

        const searchTerm = state.views.search.systemUsersSearch?.term || '';
        let users = [];
        if (searchTerm) {
            users = searchProfilesInChannel(state, channelId, searchTerm, false, true);
            usersToAdd = searchUsersToAdd(usersToAdd, searchTerm);
        } else {
            users = doGetProfilesInChannel(state, channelId, true);
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
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getChannelStats,
            loadProfilesAndReloadChannelMembers,
            searchProfilesAndChannelMembers,
            setSystemUsersSearch,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ChannelMembers);
